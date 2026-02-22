const Task = require('../models/task');
const ExpressError = require('../utils/ExpressError');
const { taskSchema, signupSchema, loginSchema } = require('../utils/validationSchemas');

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
  const { error } = taskSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessages = error.details.map((el) => el.message);
    req.flash('validationErrors', errorMessages);
    return res.redirect(req.originalUrl.includes('/edit') ? req.originalUrl : '/tasks/new');
  }
  return next();
};

module.exports.validateSignup = (req, res, next) => {
  const { error } = signupSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessages = error.details.map((el) => el.message);
    req.flash('validationErrors', errorMessages);
    return res.redirect('/signup');
  }
  return next();
};

module.exports.validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessages = error.details.map((el) => el.message);
    req.flash('validationErrors', errorMessages);
    return res.redirect('/login');
  }
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
    return res.redirect('/tasks');
  }
  res.locals.task = task;
  return next();
};
