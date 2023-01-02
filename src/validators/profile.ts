import { Joi, schema } from "express-validation";

export const CreateProfile: schema = {
    body: Joi.object({
        fullName: Joi.string().required(),
        college: Joi.string().required(),
        rollNo: Joi.string().required(),
        department: Joi.string().required(),
        year: Joi.number().max(5).required(),
        dob: Joi.date().required(),
        phone: Joi.string().regex(/^[0-9]{10}$/).required(),
        alternatePhone: Joi.string().regex(/^[0-9]{10}$/),
        interestedSubject: Joi.string(),
        idImage: Joi.string().required()
    }),
};
