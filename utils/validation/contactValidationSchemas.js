const Joi = require("joi");

const addContactSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  favorite: Joi.boolean(),
}).messages({
  "any.required": `Missing required {#key} field`,
  "object.unknown": `{#key} field is not allowed`,
});

const updateContactFavoriteSchema = Joi.object({
  favorite: Joi.boolean().required(),
}).messages({
  "any.required": `Missing required {#key} field`,
  "object.unknown": `{#key} field is not allowed`,
});

const contactSchema = {
  addContactSchema,
  updateContactFavoriteSchema,
};

module.exports = { contactSchema };
