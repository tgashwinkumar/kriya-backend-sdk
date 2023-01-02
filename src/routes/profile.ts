import bodyParser from "body-parser";
import express, { Request, Response, Router } from "express";
import { validate } from "express-validation";
import { isEmailFromPSG } from "../generators";

import { IResLocals } from "../interfaces/http";
import { createProfile, fetchProfile, readIdImage, updateProfile, uploadIdImage } from "../services/profile";
import { EVOptions, JoiOptions } from "../validators";
import { CreateProfile } from "../validators/profile";

export default (): Router => {

    const router = express.Router();

    router.get("/", (req: Request, res: Response) => {

        const locals: IResLocals = res.locals as IResLocals;

        fetchProfile(locals.kriyaId)
            .then((user) => {
                res.status(200).send(user);
            }).catch((err) => {
                res.status(500).json(err);
            });
    });

    router.post("/", validate(CreateProfile, EVOptions, JoiOptions), (req: Request, res: Response) => {

        const locals: IResLocals = res.locals as IResLocals;

        req.body.isPSGStudent = isEmailFromPSG(locals.email) ? 'Y' : 'N';

        if(req.body.isPSGStudent === 'Y') {
            req.body.college = "PSG College of Technology";
        }

        uploadIdImage(locals.kriyaId, 'id', req.body.idImage)
            .then(() => {
                return createProfile(locals.kriyaId, req.body)
                    .then(() => {
                        res.status(200).send();
                    })
            }).catch((err) => {
                res.status(500).json(err);
            });

    });

    router.put("/", (req: Request, res: Response) => {

        const locals: IResLocals = res.locals as IResLocals;
        const body = req.body;
        updateProfile(locals.kriyaId, body)
            .then(() => {
                res.status(200).send();
            }).catch((err) => {
                res.status(500).json(err);
            });
    });

    router.post("/upload/id/:key", bodyParser.text(), (req: Request, res: Response) => {

        const locals: IResLocals = res.locals as IResLocals;
        const body = req.body;

        uploadIdImage(locals.kriyaId, req.params.key, body)
            .then(() => {
                res.status(200).send();
            }).catch((err) => {
                res.status(500).json(err);
            });

    });

    router.get("/download/id/:key", (req: Request, res: Response) => {

        const locals: IResLocals = res.locals as IResLocals;

        readIdImage(locals.kriyaId, req.params.key)
            .then((imageData) => {
                res.status(200).send(imageData);
            }).catch((err) => {
                res.status(500).json(err);
            });

    });

    return router;

};
