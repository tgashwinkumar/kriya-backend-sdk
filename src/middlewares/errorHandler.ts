import { Errback, ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { ValidationError } from "express-validation";

export const errorHandler: ErrorRequestHandler = (err: Errback, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ValidationError) {
        const errResp = {
            code: "validation/error",
            message: Object.values((err.details as any)[0]),
        };

        return res.status(err.statusCode).json(errResp);
    }

    return  res.status(500).json(err);
};
