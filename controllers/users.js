const crypto = require('crypto');
const passport = require('passport');
const User = require('../models/user');

const OTP_EXPIRY_MINUTES = 10;
const RESET_TOKEN_EXPIRY_MINUTES = 10;

const generateOtp = () => `${Math.floor(100000 + Math.random() * 900000)}`;
const hashValue = (value) => crypto.createHash('sha256').update(value).digest('hex');

module.exports.renderSignup = (req, res) => {
  res.render('auth/signup');
};

module.exports.signup = async (req, res) => {
  const { username, email, password } = req.body;
  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    req.flash('error', 'Username or email already exists.');
    return res.redirect('/signup');
  }

  const otp = generateOtp();
  const otpHash = hashValue(otp);
  const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  const user = new User({ username, email, isVerified: false, otpHash, otpExpiresAt });
  const registeredUser = await User.register(user, password);

  req.session.pendingVerificationUserId = registeredUser._id.toString();

  console.log(`[DEV OTP] ${registeredUser.email}: ${otp}`);
  req.flash('success', `Account created. OTP sent to ${registeredUser.email}. (Dev OTP logged in server console)`);
  return res.redirect('/verify-otp');
};

module.exports.renderVerifyOtp = async (req, res) => {
  if (!req.session.pendingVerificationUserId) {
    req.flash('error', 'Please signup first to verify your email.');
    return res.redirect('/signup');
  }
  return res.render('auth/verify-otp');
};

module.exports.verifyOtp = async (req, res) => {
  const { otp } = req.body;
  const userId = req.session.pendingVerificationUserId;

  if (!userId) {
    req.flash('error', 'Verification session expired. Please signup again.');
    return res.redirect('/signup');
  }

  const user = await User.findById(userId);
  if (!user) {
    req.flash('error', 'User not found. Please signup again.');
    return res.redirect('/signup');
  }

  if (!user.otpHash || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
    req.flash('error', 'OTP has expired. Please request a new OTP.');
    return res.redirect('/verify-otp');
  }

  if (hashValue(otp) !== user.otpHash) {
    req.flash('error', 'Invalid OTP. Please try again.');
    return res.redirect('/verify-otp');
  }

  user.isVerified = true;
  user.otpHash = undefined;
  user.otpExpiresAt = undefined;
  await user.save();

  delete req.session.pendingVerificationUserId;
  req.flash('success', 'Email verified successfully. You can now login.');
  return res.redirect('/login');
};

module.exports.resendOtp = async (req, res) => {
  const userId = req.session.pendingVerificationUserId;
  if (!userId) {
    req.flash('error', 'Verification session expired. Please signup again.');
    return res.redirect('/signup');
  }

  const user = await User.findById(userId);
  if (!user) {
    req.flash('error', 'User not found. Please signup again.');
    return res.redirect('/signup');
  }

  const otp = generateOtp();
  user.otpHash = hashValue(otp);
  user.otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  await user.save();

  console.log(`[DEV OTP RESEND] ${user.email}: ${otp}`);
  req.flash('success', 'A new OTP has been sent to your email. (Dev OTP logged in server console)');
  return res.redirect('/verify-otp');
};

module.exports.renderLogin = (req, res) => {
  res.render('auth/login');
};

module.exports.login = (req, res, next) => {
  passport.authenticate('local', async (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      req.flash('error', info?.message || 'Invalid username or password.');
      return res.redirect('/login');
    }

    if (!user.isVerified) {
      req.session.pendingVerificationUserId = user._id.toString();
      req.flash('error', 'Please verify your email using OTP before logging in.');
      return res.redirect('/verify-otp');
    }

    return req.logIn(user, (loginErr) => {
      if (loginErr) return next(loginErr);
      req.flash('success', `Welcome back, ${user.username}!`);
      const redirectUrl = res.locals.returnTo || '/dashboard';
      delete req.session.returnTo;
      return res.redirect(redirectUrl);
    });
  })(req, res, next);
};

module.exports.renderForgotPassword = (req, res) => {
  res.render('auth/forgot-password');
};

module.exports.sendResetToken = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = hashValue(resetToken);
    user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000);
    await user.save();

    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
    console.log(`[DEV RESET LINK] ${user.email}: ${resetUrl}`);
    req.flash('success', 'Password reset link sent to your email. (Dev link logged in server console)');
  } else {
    req.flash('success', 'If an account with that email exists, a reset link has been sent.');
  }

  return res.redirect('/forgot-password');
};

module.exports.renderResetPassword = async (req, res) => {
  const tokenHash = hashValue(req.params.token);
  const user = await User.findOne({
    resetPasswordToken: tokenHash,
    resetPasswordExpires: { $gt: new Date() }
  });

  if (!user) {
    req.flash('error', 'Reset link is invalid or has expired.');
    return res.redirect('/forgot-password');
  }

  return res.render('auth/reset-password', { token: req.params.token });
};

module.exports.resetPassword = async (req, res) => {
  const tokenHash = hashValue(req.params.token);
  const user = await User.findOne({
    resetPasswordToken: tokenHash,
    resetPasswordExpires: { $gt: new Date() }
  });

  if (!user) {
    req.flash('error', 'Reset link is invalid or has expired.');
    return res.redirect('/forgot-password');
  }

  await user.setPassword(req.body.password);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  req.flash('success', 'Password reset successful. Please login.');
  return res.redirect('/login');
};


module.exports.renderProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.render('auth/profile', { user });
};

module.exports.renderEditProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.render('auth/edit-profile', { user });
};

module.exports.updateProfile = async (req, res) => {
  const { username, email } = req.body;
  const existingUser = await User.findOne({
    _id: { $ne: req.user._id },
    $or: [{ username }, { email }]
  });

  if (existingUser) {
    req.flash('error', 'Username or email is already in use by another account.');
    return res.redirect('/dashboard/profile/edit');
  }

  await User.findByIdAndUpdate(req.user._id, { username, email });
  req.flash('success', 'Profile updated successfully.');
  return res.redirect('/dashboard/profile');
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash('success', 'Logged out successfully.');
    return res.redirect('/login');
  });
};
