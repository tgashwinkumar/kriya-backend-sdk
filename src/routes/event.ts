import express, { Request, Response, Router } from "express";

import { handleError } from "../exceptions";
import { IResLocals } from "../interfaces/http";
import { checkEventRegistration, getEventUrlById, listEvents, registerEventUsingKriyaId } from "../services/event";

export default (): Router => {

    const router = express.Router();

    router.get('/:eventId/register', (req: Request, res: Response) => {

        const eventId: number = Number(req.params.eventId);
        const locals: IResLocals = res.locals as IResLocals;

        checkEventRegistration(locals.kriyaId, eventId)
            .then((regStatus) => {
                res.status(200).json({
                    registered: regStatus
                })
            }).catch((err) => {
                res.status(500).json(err);
            });
    })

    router.post("/:eventId/register", (req: Request, res: Response) => {

        const eventId: number = Number(req.params.eventId);
        const locals: IResLocals = res.locals as IResLocals;

        if(process.env.EVENT_REGISTRATION === "N") {
            res.status(400).json({
                code: 'registration/closed',
                message: 'Registration closed'
            })
        } else if (process.env.EVENT_REGISTRATION === "Y") {
            if(eventId === 13) {
                res.status(400).json({
                    code: 'registration/closed',
                    message: 'Registration closed'
                })
            } else {
                registerEventUsingKriyaId(locals.kriyaId, eventId)
                    .then(() => {
                        res.status(200).send();
                    }).catch((err) => {
                        res.status(500).json(err);
                    });
            }
        }

    });

    router.get("/:eventId/join", (req: Request, res: Response) => {

        const eventId: number = Number(req.params.eventId);
        const locals: IResLocals = res.locals as IResLocals;

        getEventUrlById(eventId)
            .then((event) => {
                res.status(200).send(event);
            }).catch((err) => {
                res.status(500).json(err);
            });

    });

    return router;

};

export const unAuthenticatedReqs = (): Router => {

    const router = express.Router();

    router.get("/", (req: Request, res: Response, next) => {

        listEvents()
            .then((events) => {
                res.status(200).json(events);
            }).catch((err) => {
                res.status(500).json(err);
            });
    });

    return router;

};
