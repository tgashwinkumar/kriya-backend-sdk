import { Joi, schema } from "express-validation";

export const LoginValidation: schema = {
    headers: Joi.object({
        authorization: Joi.string().regex(/[bB]asic [A-z0-9+/]*/).required(),
    }).unknown(true),
};

export const ResetPassword: schema = {
    body: Joi.object({
        email: Joi.string().email().required(),
    }),
};

export const ConfirmReset: schema = {
    body: Joi.object({
        password: Joi.string().required(),
        code: Joi.string().required(),
    }),
};
