const Task = require('../models/task');
const ExpressError = require('../utils/ExpressError');
const {
  taskSchema,
  signupSchema,
  loginSchema,
  verifyOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} = require('../utils/validationSchemas');

const validateWithFlash = (schema, req, res, redirectTo) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessages = error.details.map((el) => el.message);
    req.flash('validationErrors', errorMessages);
    res.redirect(redirectTo);
    return false;
  }
  return true;
};

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash('error', 'You must be signed in first.');
    return res.redirect('/login');
  }
  return next();
};

module.exports.storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};

module.exports.validateTask = (req, res, next) => {
  if (!validateWithFlash(taskSchema, req, res, req.originalUrl.includes('/edit') ? req.originalUrl : '/dashboard/new')) return;
  return next();
};

module.exports.validateSignup = (req, res, next) => {
  if (!validateWithFlash(signupSchema, req, res, '/signup')) return;
  return next();
};

module.exports.validateLogin = (req, res, next) => {
  if (!validateWithFlash(loginSchema, req, res, '/login')) return;
  return next();
};

module.exports.validateOtp = (req, res, next) => {
  if (!validateWithFlash(verifyOtpSchema, req, res, '/verify-otp')) return;
  return next();
};

module.exports.validateForgotPassword = (req, res, next) => {
  if (!validateWithFlash(forgotPasswordSchema, req, res, '/forgot-password')) return;
  return next();
};

module.exports.validateResetPassword = (req, res, next) => {
  if (!validateWithFlash(resetPasswordSchema, req, res, req.originalUrl)) return;
  return next();
};

module.exports.isTaskOwner = async (req, res, next) => {
  const { id } = req.params;
  const task = await Task.findById(id);
  if (!task) {
    throw new ExpressError('Task not found', 404);
  }
  if (!task.owner.equals(req.user._id)) {
    req.flash('error', 'You do not have permission to access this task.');
    return res.redirect('/dashboard');
  }
  res.locals.task = task;
  return next();
};
