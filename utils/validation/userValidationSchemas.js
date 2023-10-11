const Joi = require("joi");

const registerSchema = Joi.object({
  password: Joi.string().min(5).required(),
  email: Joi.string().email().required(),
});

const loginSchema = Joi.object({
  password: Joi.string().min(5).required(),
  email: Joi.string().email().required(),
});

const userSchema = {
  registerSchema,
  loginSchema,
};

module.exports = { userSchema };
