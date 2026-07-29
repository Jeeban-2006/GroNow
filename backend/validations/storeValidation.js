const Joi = require("joi");

const createStoreSchema = Joi.object({

    shop_name: Joi.string()
        .min(3)
        .max(100)
        .required(),

    description: Joi.string()
        .allow("")
        .optional(),

    address: Joi.string()
        .required(),

    city: Joi.string()
        .required(),

    state: Joi.string()
        .required(),

    pincode: Joi.string()
        .pattern(/^[0-9]{6}$/)
        .required()
        .messages({
            "string.pattern.base": "Pincode must contain exactly 6 digits."
        }),

    latitude: Joi.number()
        .min(-90)
        .max(90)
        .required(),

    longitude: Joi.number()
        .min(-180)
        .max(180)
        .required(),

    opening_time: Joi.string()
        .required(),

    closing_time: Joi.string()
        .required(),

    contact_number: Joi.string()
        .pattern(/^[0-9]{10}$/)
        .required()
        .messages({
            "string.pattern.base": "Contact number must contain exactly 10 digits."
        })

});

module.exports = {
    createStoreSchema
};