const Joi = require('joi');

const taskSchema = Joi.object({
  task: Joi.object({
    title: Joi.string().trim().required().messages({
      'string.empty': 'Task title is required'
    }),
    description: Joi.string().allow(''),
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

module.exports = {
  taskSchema,
  signupSchema,
  loginSchema
};
