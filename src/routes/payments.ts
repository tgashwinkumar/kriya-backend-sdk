import { Request, Response, Router } from "express";
import { IResLocals } from "../interfaces/http";
import { completePayment, fetchLastPayment, fetchPayment, getReceiptDataFromEncryptedId, initiateGeneralRegistrationPayment, initiateWorkshopPayment } from "../services/payments";
import authorizationMiddleware from '../middlewares/authorization';

import generalFeePaymentCheck from "../middlewares/generalFeePaymentCheck";
import isProfileCompleted from "../middlewares/isProfileCompleted";
import { handleError, paymentExceptions, registrationExceptions } from "../exceptions";
import ejs from 'ejs';
import path from 'path';

export default (): Router => {

    const router = Router();

    router.get('/last', authorizationMiddleware, (req: Request, res: Response) => {

        const locals: IResLocals = res.locals as IResLocals;

        fetchLastPayment(locals.kriyaId)
            .then((transaction) => {
                if (!transaction) {
                    res.status(404).send();
                } else {
                    res.status(200).json(transaction);
                }
            })
    });

    router.get("/general/initiate", authorizationMiddleware, isProfileCompleted, (req: Request, res: Response) => {

        const locals: IResLocals = res.locals as IResLocals;

        if(process.env.GENERAL_REGISTRATION === "N") {
            res.status(400).json({
                code: 'registration/closed',
                message: 'Registration closed'
            });
        } else if (process.env.GENERAL_REGISTRATION === "Y") {
            if(locals.generalFeePaid) {
                res.status(400).json({
                    code: registrationExceptions.DUPLICATE_GENERAL_PAYMENT,
                    message: 'User has already paid the general registration fee'
                });
            } else {
                initiateGeneralRegistrationPayment(locals.kriyaId).then((paymentUrl) => {
                    res.json({ paymentUrl });
                }).catch((err) => {
                    res.status(500).json(err);
                });
            }
        }

    });

    router.get("/workshop/:workshopId/initiate", authorizationMiddleware, isProfileCompleted, generalFeePaymentCheck, (req: Request, res: Response) => {


        if(process.env.WORKSHOP_REGISTRATION === "N") {
            res.status(400).json({
                code: 'registration/closed',
                message: 'Registration closed'
            });
        } else if (process.env.WORKSHOP_REGISTRATION === "Y") {
            const locals: IResLocals = res.locals as IResLocals;
            const workshopId: number = Number(req.params.workshopId);

            initiateWorkshopPayment(locals.kriyaId, workshopId)
                .then((paymentUrl) => {
                    res.json({ paymentUrl });
                }).catch((err) => {
                    res.status(500).json(err);
                });
        }

    });

    router.get('/:eventId', authorizationMiddleware, (req: Request, res: Response) => {

        const locals: IResLocals = res.locals as IResLocals;
        const eventId: number = parseInt(req.params.eventId as string);

        fetchPayment(locals.kriyaId, eventId)
            .then((result) => {
                res.status(200).json(result)
            }).catch((err) => {
                res.status(500).json(err);
            });

    });

    return router;
};

export const unAuthenticatedReqs = (): Router => {

    const router = Router();

    router.get('/confirm', (req: Request, res: Response) => {

        const encryptedData = req.query.data as string;
        completePayment(encryptedData)
            .then(() => {
                res.redirect('/payment/success');
            }).catch((err) => {
                res.redirect('/payment/failed?error='+err.code);
            })
    });

    router.get('/success', (req: Request, res: Response) => {
        res.status(200).render('payment-success')
    });

    router.get('/failed', (req: Request, res: Response) => {
        res.status(200).render('payment-failure')
    });

    router.get('/receipt', (req: Request, res: Response) => {

        const encryptedTransactionId: string = req.query.transaction as string;

        if(!encryptedTransactionId) {
            res.status(404).send();
        } else {
            getReceiptDataFromEncryptedId(encryptedTransactionId)
                .then((data) => {
                    res.removeHeader('content-security-policy');
                    // return generateReceiptPdf(data)
                    //     .then((pdfBuffer) => {
                    //         res.set('Content-Type', 'application/pdf');
                    //         res.end(pdfBuffer)
                    //     })
                    res.render('receipt', data);
                }).catch((err) => {
                    if(err.code === paymentExceptions.PAYMENT_FAILED || err.code === paymentExceptions.TRANSACTION_SESSION_EXISTS) {
                        res.status(500).send(`<h3>${err.message}</h3>`)
                    } else {
                        res.status(500).send(`<h3>Error generating receipt</h3>`)
                    }
                })
        }

    })

    return router;

};
