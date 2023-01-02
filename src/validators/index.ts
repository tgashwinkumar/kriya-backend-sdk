import { EvOptions } from "express-validation";
import { ValidationOptions } from "joi";

export const EVOptions: EvOptions = {keyByField: true};

export const JoiOptions: ValidationOptions = {abortEarly: false};
