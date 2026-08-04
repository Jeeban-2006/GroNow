const Joi = require("joi");

const registerSchema = Joi.object({
    first_name: Joi.string()
        .min(2)
        .max(50)
        .required(),

    last_name: Joi.string()
        .min(2)
        .max(50)
        .required(),

    email: Joi.string()
        .email()
        .required(),

    phone: Joi.string()
        .pattern(/^[0-9]{10}$/)
        .required(),

    password: Joi.string()
        .min(8)
        .max(20)
        .required(),

    role: Joi.string()
        .valid("CUSTOMER", "STORE_OWNER", "DELIVERY", "ADMIN")
        .required()
});

const loginSchema = Joi.object({
    email: Joi.string()
        .email()
        .required(),

    password: Joi.string()
        .required()
});

module.exports = {
    registerSchema,
    loginSchema
};