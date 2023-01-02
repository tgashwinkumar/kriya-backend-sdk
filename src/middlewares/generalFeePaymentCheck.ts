import { NextFunction, Request, Response } from "express";

import { handleError, registrationExceptions } from "../exceptions";
import { IResLocals } from "../interfaces/http";

export default (req: Request, res: Response, next: NextFunction) => {

    const locals: IResLocals = res.locals as IResLocals;

    if (!locals.generalFeePaid) {
        const response = handleError(registrationExceptions.GENERAL_FEE_NOT_PAID, "", {}, locals.kriyaId);
        res.status(403).json(response);
    } else {
        next();
    }

};
