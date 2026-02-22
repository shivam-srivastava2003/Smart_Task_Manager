const express = require('express');
const router = express.Router();

const catchAsync = require('../utils/catchAsync');
const users = require('../controllers/users');
const {
  validateSignup,
  validateLogin,
  validateOtp,
  validateForgotPassword,
  validateResetPassword,
  storeReturnTo,
  isLoggedIn
} = require('../middleware');

router.route('/signup').get(users.renderSignup).post(validateSignup, catchAsync(users.signup));

router.get('/verify-otp', catchAsync(users.renderVerifyOtp));
router.post('/verify-otp', validateOtp, catchAsync(users.verifyOtp));
router.post('/verify-otp/resend', catchAsync(users.resendOtp));

router.route('/login').get(users.renderLogin).post(validateLogin, storeReturnTo, users.login);

router.route('/forgot-password').get(users.renderForgotPassword).post(validateForgotPassword, catchAsync(users.sendResetToken));

router
  .route('/reset-password/:token')
  .get(catchAsync(users.renderResetPassword))
  .post(validateResetPassword, catchAsync(users.resetPassword));

router.post('/logout', isLoggedIn, users.logout);

module.exports = router;
