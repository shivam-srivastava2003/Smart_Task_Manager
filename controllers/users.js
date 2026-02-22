const passport = require('passport');
const User = require('../models/user');

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

  const user = new User({ username, email });
  const registeredUser = await User.register(user, password);
  req.login(registeredUser, (err) => {
    if (err) {
      req.flash('error', 'Could not login after signup.');
      return res.redirect('/login');
    }
    req.flash('success', 'Welcome! Account created successfully.');
    return res.redirect('/tasks');
  });
};

module.exports.renderLogin = (req, res) => {
  res.render('auth/login');
};

module.exports.login = [
  passport.authenticate('local', {
    failureFlash: true,
    failureRedirect: '/login'
  }),
  (req, res) => {
    req.flash('success', `Welcome back, ${req.user.username}!`);
    const redirectUrl = res.locals.returnTo || '/tasks';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
  }
];

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash('success', 'Logged out successfully.');
    return res.redirect('/login');
  });
};
