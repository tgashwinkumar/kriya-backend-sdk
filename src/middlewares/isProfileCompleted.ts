import { NextFunction, Request, Response } from "express";

import { handleError, ProfileExceptions } from "../exceptions";
import { IResLocals } from "../interfaces/http";

export default (req: Request, res: Response, next: NextFunction) => {

    const locals: IResLocals = res.locals as IResLocals;

    if (!locals.ProfileCompleted) {
        const response = handleError(ProfileExceptions.PROFILE_NOT_COMPLETED, "", {}, locals.kriyaId);
        res.status(403).json(response);
    } else {
        next();
    }

};
