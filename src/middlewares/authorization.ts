import { bearer } from "@borderless/parse-authorization";
import { NextFunction, Request, Response } from "express";
import Admin from "firebase-admin";

import { authDetailsByEmail } from "../database/services/user";
import { AuthExceptions, handleError } from "../exceptions";
import { IFirebaseAdminError } from "../interfaces/firebase";

/**
 * Authorization middleware
 * Verified Id token from authorization header and extracts the email ID
 * Using the email kriya Id and general fee payment flag is set in res locales
 * @param req
 * @param res
 * @param next
 */
export default (req: Request, res: Response, next: NextFunction) => {

    const token: string = req.headers.authorization as string;

    // If the token is not sent in authorization header
    if (!token) {
        res.status(401).json(handleError(AuthExceptions.MISSING_CREDENTIALS, "Access token not found"));
    } else {
        // Extract Id token from authorization header
        const extractedToken = bearer(token) as string;
        // If it is not a valid token
        if (!extractedToken) {
            res.status(401).json(handleError(AuthExceptions.INVALID_TOKEN, "Invalid Access Token"));
        } else {
            // Verify the Id token and extract user email
            return Admin.app(process.env.FIREBASE_ADMIN_APP_NAME).auth().verifyIdToken(extractedToken)
                .then((data) => {
                    // Fetch kriya Id and general registration payment flag from database using the email
                    return authDetailsByEmail(data.email as string)
                        .then((dbData: any = {}) => {
                            res.locals = {
                                ...res.locals,
                                email: data.email,
                                uid: data.uid,
                                kriyaId: dbData.kriyaId,
                                generalFeePaid: (dbData.transactions || []).length !== 0,
                                ProfileCompleted: Boolean(dbData.profile),
                                PSGStudent: (dbData.profile || {}).isPSGStudent === "Y",
                            };
                            next();
                        });
                }).catch((err: IFirebaseAdminError | any) => {
                    const errorInfo = err.errorInfo || {};
                    if (errorInfo.code === AuthExceptions.TOKEN_EXPIRED) {
                        res.status(401).json(handleError(errorInfo.code, "Generate a new token and try again"));
                    } else if (errorInfo.code === AuthExceptions.INVALID_TOKEN) {
                        res.status(401).json(handleError(errorInfo.code, "Invalid Access Token"));
                    } else {
                        res.status(500).json(handleError(AuthExceptions.USER_AUTH_ERROR, "Unable to verify credentials"));
                    }
                });
        }
    }

};
