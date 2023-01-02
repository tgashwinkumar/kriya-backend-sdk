import { basic as basicAuthParser } from "@borderless/parse-authorization";
import { Request, Response, Router } from "express";
import { validate } from "express-validation";
import queryString from 'query-string';

import { handleError } from "../exceptions";
import { IConfirmResetPasswordRequest, IResetPasswordRequest, ISignUpRequest } from "../interfaces/http";
import { changePasswordAfterReset, loginWithKriyaId, sendResetPasswordEmail, signUpWithEmail, verifyEmailAndGenerateKriyaId } from "../services/authentication";
import { EVOptions, JoiOptions } from "../validators";
import { ConfirmReset, LoginValidation, ResetPassword } from "../validators/authentication";

export default (): Router => {

    const router = Router();
    const webAppBaseUrl = process.env.WEB_APP_BASE_URL as string;
    const firebaseAuthUI = `https://${process.env.FIREBASE_APP_NAME as string}.firebaseapp.com/__/auth/action`;

    router.get("/login", validate(LoginValidation, EVOptions, JoiOptions), (req: Request, res: Response) => {

        if (!req.headers.authorization) {
            res.status(401).json(handleError("auth/credentials-error", "Authorization header is missing"));
        } else {
            const credentials = basicAuthParser(req.headers.authorization);
            if (credentials) {
                const [kriyaId, password] = credentials;
                loginWithKriyaId(kriyaId, password)
                    .then((tokens) => {
                        res.status(200).json(tokens);
                    }).catch((err) => {
                        res.status(401).json(err);
                    });
            } else {
                res.status(401).json(handleError("auth/credentials-error", "Unable to parse credentials"));
            }
        }

    });

    router.post("/signup", (req: Request, res: Response) => {

        const body: ISignUpRequest = req.body;

        signUpWithEmail(body, body.password)
            .then(() => {
                res.status(200).send();
            }).catch((err) => {
                res.status(500).json(err);
            });

    });

    router.get("/verify-email", (req: Request, res: Response) => {

        const { mode, oobCode, apiKey } = req.query;

        if (!oobCode) {
            res.status(403).send();
        } else {
            if(mode === "verifyEmail") {
                verifyEmailAndGenerateKriyaId(oobCode as string).then((kriyaId) => {
                    res.redirect(`${webAppBaseUrl}/login.html?kriyaId=${kriyaId}`);
                }).catch((err) => {
                    res.status(500).json(err);
                });
            } else if (mode === "resetPassword") {

                res.redirect(`${firebaseAuthUI}?${queryString.stringify({mode, oobCode, apiKey})}`);
            }
        }

    });

    router.post("/reset", validate(ResetPassword, EVOptions, JoiOptions) , (req: Request, res: Response) => {

        const body: IResetPasswordRequest = req.body;

        sendResetPasswordEmail(body.email).then(() => {
            res.status(200).send();
        }).catch((err) => {
            res.status(500).json(err);
        });

    });

    router.post("/confirm-reset", validate(ConfirmReset, EVOptions, JoiOptions), (req: Request, res: Response) => {

        const body: IConfirmResetPasswordRequest = req.body;

        changePasswordAfterReset(body.code, body.password).then(() => {
            res.status(200).send();
        }).catch((err) => {
            res.status(500).json(err);
        });

    });

    return router;
};
