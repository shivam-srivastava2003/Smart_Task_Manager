const express = require('express');
const router = express.Router();

const catchAsync = require('../utils/catchAsync');
const users = require('../controllers/users');
const { validateSignup, validateLogin, storeReturnTo, isLoggedIn } = require('../middleware');

router
  .route('/signup')
  .get(users.renderSignup)
  .post(validateSignup, catchAsync(users.signup));

router
  .route('/login')
  .get(users.renderLogin)
  .post(validateLogin, storeReturnTo, ...users.login);

router.post('/logout', isLoggedIn, users.logout);

module.exports = router;
