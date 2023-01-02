import express, { Request, Response, Router } from "express";

import { IResLocals } from "../interfaces/http";
import { checkWorkshopRegistration, getWorkshopUrlById, listWorkshops, registerWorkshopUsingKriyaId } from "../services/workshop";

export default (): Router => {

    const router = express.Router();

    router.get('/:workshopId/register', (req: Request, res: Response) => {

        const workshopId: number = Number(req.params.workshopId);
        const locals: IResLocals = res.locals as IResLocals;

        checkWorkshopRegistration(locals.kriyaId, workshopId)
            .then((regStatus) => {
                res.status(200).json(regStatus)
            }).catch((err) => {
                res.status(500).json(err);
            });
    })

    router.get("/:workshopId/join", (req: Request, res: Response) => {

        const workshopId: number = Number(req.params.workshopId);
        const locals: IResLocals = res.locals as IResLocals;

        getWorkshopUrlById(locals.kriyaId, workshopId)
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

        listWorkshops()
            .then((workshops) => {
                res.status(200).json(workshops);
            }).catch((err) => {
                res.status(500).json(err);
            });
    });

    return router;

};
