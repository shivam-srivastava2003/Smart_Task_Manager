const Joi = require('joi');

const taskSchema = Joi.object({
  task: Joi.object({
    title: Joi.string().trim().required().messages({
      'string.empty': 'Task title is required'
    }),
    description: Joi.string().allow(''),
    category: Joi.string().valid('Personal', 'Professional', 'Student').required(),
    priority: Joi.string().valid('Low', 'Medium', 'High').required(),
    deadline: Joi.date().allow('', null),
    status: Joi.string().valid('Pending', 'Completed').required()
  }).required()
});

const signupSchema = Joi.object({
  username: Joi.string().trim().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  username: Joi.string().trim().required(),
  password: Joi.string().required()
});

const verifyOtpSchema = Joi.object({
  otp: Joi.string().pattern(/^\d{6}$/).required().messages({
    'string.pattern.base': 'OTP must be a 6-digit number.'
  })
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required()
});

const resetPasswordSchema = Joi.object({
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match.'
  })
});

module.exports = {
  taskSchema,
  signupSchema,
  loginSchema,
  verifyOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema
};
