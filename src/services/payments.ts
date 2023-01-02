import { Op } from "sequelize";
import moment from 'moment-timezone';
import { decryptData, encryptData } from "../crypto";
import { PaymentTransaction, Profile } from "../database";
import { findEventById } from "../database/services/event";
import { fetchTransactions, initializeTransaction } from "../database/services/payments";
import { createWorkshopRegistration, findWorkshopById } from "../database/services/workshop";
import { handleError, paymentExceptions, registrationExceptions } from "../exceptions";
import { IPaymentResponseData } from "../interfaces/http";
import { findUserByKriyaId } from "./profile";
import { formatPaymentUrl } from '../generators';
import { sendPaymentMail } from "../messaging/mailer";
import { checkWorkshopAvailability } from "./workshop";
import { IPaymentReceiptData } from '../interfaces/http';
import writtenNumber from 'written-number';


const generateEncryptedPaymentData = (transactionId: string, kriyaId: string, email: string, name: string, fee: number) => {
    const redirectURL = `${process.env.SERVER_BASEPATH}/payment/confirm`;
    const raw = `kriyaid=${kriyaId} name=${name.replace(/\s/g, '$')} email=${email} categoryid=9 transactionid=${transactionId} fees=${fee} returnurl=${redirectURL}`;
    return encryptData(raw)
}

const decryptPaymentDataToJson = (encryptedData: string): IPaymentResponseData => {
    const raw = decryptData(encryptedData);
    const responseArr = raw.split('&');
    return {
        kriyaid: responseArr[0],
        categoryid: parseInt(responseArr[1], 10),
        transactionid: responseArr[2],
        status: parseInt(responseArr[3], 10)
    }
}

/**
 *
 * @param kriyaId Participant Kriya Id
 */
export const initiateGeneralRegistrationPayment = (kriyaId: string) => {
    const paymentAfter = moment().tz("Asia/Kolkata").subtract(0, "minutes");
    return findUserByKriyaId(kriyaId, {
        include: [{
            as: "profile",
            model: Profile,
            attributes: ["fullName", "isPSGStudent"]
        }, {
            as: "transactions",
            model: PaymentTransaction,
            where: {
                kriyaId,
                type: 'E',
                eventId: -1,
                [Op.or]: [
                    {status: 'S'},
                    {[Op.and]: [
                        {status: 'I'},
                        {createdAt: {
                            [Op.gt]: paymentAfter.toISOString()
                        }}
                    ]}
                ],
            },
            limit: 1,
            order: [["createdAt", "DESC"]],
            attributes: ["status"],
            required: false
        }]
    }).then((_user) => {
        const user: any = _user.toJSON();
        if(user.transactions.length !== 0) {
            if(user.transactions[0].status === 'I') {
                throw handleError(paymentExceptions.TRANSACTION_SESSION_EXISTS, 'Transaction has been already initiated for this workshop. Try after some time', null, kriyaId);
            } else {
                throw handleError(registrationExceptions.WORKSHOP_DUPLICATE, 'User has already paid for the general registration', null, kriyaId);
            }
        }
        return findEventById(1, ["psgFee", "nonPsgFee"]).then((event) => {
            const fee: number = user.profile.isPSGStudent === 'Y' ? event.getDataValue('psgFee') : event.getDataValue('nonPsgFee');
            return initializeTransaction(kriyaId, user.email, user.profile.fullName, 'E', -1, fee).then((transactionId) => {
                const encryptedData = generateEncryptedPaymentData(transactionId, kriyaId, user.email, user.profile.fullName, fee);
                return formatPaymentUrl(encryptedData);
            });
        });
    })

}

export const initiateWorkshopPayment = (kriyaId: string, workshopId: number) => {
    const paymentAfter = moment().tz("Asia/Kolkata").subtract(5, "minutes");
    return checkWorkshopAvailability(workshopId).then(({count, capacity}) => {
        if(capacity < count) {
            throw handleError(registrationExceptions.WORKSHOP_FULL, 'No Seats available for the workshop', {}, `W-${workshopId}`)
        } else {
            return findUserByKriyaId(kriyaId, {
                include: [{
                    as: "profile",
                    model: Profile,
                    attributes: ["fullName", "isPSGStudent"]
                }, {
                    as: "transactions",
                    model: PaymentTransaction,
                    where: {
                        kriyaId,
                        type: 'W',
                        eventId: workshopId,
                        [Op.or]: [
                            {status: 'S'},
                            {[Op.and]: [
                                {status: 'I'},
                                {createdAt: {
                                    [Op.gt]: paymentAfter.toISOString()
                                }}
                            ]}
                        ],
                    },
                    limit: 1,
                    order: [["createdAt", "DESC"]],
                    attributes: ["status"],
                    required: false
                }]
            }).then((_user) => {
                const user: any = _user.toJSON();

                if(user.transactions.length !== 0) {
                    if(user.transactions[0].status === 'I') {
                        throw handleError(paymentExceptions.TRANSACTION_SESSION_EXISTS, 'Transaction has been already initiated for this workshop. Try after some time', null, kriyaId);
                    } else {
                        throw handleError(registrationExceptions.WORKSHOP_DUPLICATE, 'User has already paid for the workshop', null, kriyaId);
                    }
                }

                return findWorkshopById(workshopId, ["psgFee", "nonPsgFee"]).then((event) => {
                    const fee: number = user.profile.isPSGStudent === 'Y' ? event.getDataValue('psgFee') : event.getDataValue('nonPsgFee');
                    return initializeTransaction(kriyaId, user.email, user.profile.fullName, 'W', workshopId, fee).then((transactionId) => {
                        const encryptedData = generateEncryptedPaymentData(transactionId, kriyaId, user.email, user.profile.fullName, fee);
                        return formatPaymentUrl(encryptedData);
                    });
                });
            })
        }
    })
}

export const completePayment = (encryptedData: string) => {

    return new Promise((resolve) => {
        resolve(null);
    }).then(() => {
        try {
            const decryptedData = decryptPaymentDataToJson(encryptedData);
            return decryptedData
        } catch (error) {
            throw handleError(paymentExceptions.INVALID_DATA, 'Invalid payment data');
        }
    }).then((data: IPaymentResponseData) => {
        return PaymentTransaction.findOne({
            where: {
                transactionId: data.transactionid,
                status: 'I'
            }
        }).then((transaction) => {
            if(transaction) {
                return transaction.update({
                    status: data.status === 1 ? 'S' : 'F'
                }).then((updatedTransaction):any => {
                    if(data.status !== 1) {
                        throw handleError(paymentExceptions.PAYMENT_FAILED, 'Payment Failed', {} ,`T-${data.transactionid}`)
                    }
                    sendPaymentMail(updatedTransaction.getDataValue('kriyaId'), updatedTransaction.getDataValue('eventId'));
                    if(updatedTransaction.getDataValue('type') === 'W') {
                        return createWorkshopRegistration(updatedTransaction.getDataValue('kriyaId') as string, updatedTransaction.getDataValue('eventId') as number)
                            .then(() => {
                                return updatedTransaction.getDataValue('transactionId');
                            })
                    }
                    return updatedTransaction.getDataValue('transactionId');
                })
            } else {
                throw handleError(paymentExceptions.INVALID_TRANSACTION, '', null, `T-${data.transactionid}`)
            }
        })
    });

}

export const fetchPayment = (kriyaId: string, eventId: number) => {

    return PaymentTransaction.findOne({
        where: {
            [Op.and]: [
                {kriyaId},
                {eventId}
            ]
        },
        attributes: ["transactionId", "kriyaId", "eventId", "type", "status", ["createdAt", "startedAt"], ["updatedAt", "completedAt"], "fee"],
        order: [["transactionId", "DESC"]]
    }).then((transaction) => {
        if(!transaction) {
            throw handleError(paymentExceptions.NO_TRANSACTION, 'No Transaction found for the specific event', {}, `${kriyaId}, E-${eventId}`)
        } else {
            const json: any = transaction.toJSON();
            if(transaction.getDataValue('status') === 'I') {
                delete json.completedAt;
            } else if(transaction.getDataValue('status') === 'S') {
                json.receiptUrl = `${process.env.SERVER_BASEPATH}/payment/receipt?transaction=${encodeURIComponent(encryptData(transaction.getDataValue('transactionId')))}`;
            }
            return json;
        }
    });

}

export const fetchLastPayment = (kriyaId: string) => {
    return fetchTransactions({kriyaId}, {
        order: [['transactionId', 'DESC']],
        limit: 1,
        attributes: ["transactionId", "kriyaId", "eventId", "type", "status", ["createdAt", "startedAt"], ["updatedAt", "completedAt"], "fee"]
    }).then((transactions) => {
        if(transactions.length === 0) {
            return null;
        } else {
            return transactions[0].toJSON();
        }
    });
}

const getReceiptData = (transactionId: string) => {
    return fetchTransactions({
        transactionId
    }).then(([transaction]) => {
        if(!transaction) {
            throw handleError(paymentExceptions.NO_TRANSACTION, 'Invalid Transaction ID');
        } else if (transaction.getDataValue('status') === 'F') {
            throw handleError(paymentExceptions.PAYMENT_FAILED, 'Cannot generate receipt for failed transaction');
        } else if (transaction.getDataValue('status') === 'I') {
            throw handleError(paymentExceptions.TRANSACTION_SESSION_EXISTS, 'Cannot generate receipt for an incomplete transaction');
        } else {
            const receiptData: IPaymentReceiptData = {
                kriyaId: transaction.getDataValue('kriyaId'),
                transactionId: transaction.getDataValue('transactionId'),
                name: transaction.getDataValue('name'),
                fee: transaction.getDataValue('fee'),
                transactionDate: moment(transaction.getDataValue('updatedAt') as string).tz('Asia/Kolkata').format("DD/MM/yyyy"),
                feeInWords: writtenNumber(transaction.getDataValue('fee'))+' only'
             }
            if(transaction.getDataValue('type') === 'W') {
                return findWorkshopById(transaction.getDataValue('eventId')).then((workshop) => {
                    receiptData.purpose = `Registration for ${workshop.getDataValue('name')}`;
                    return receiptData;
                })
            }  else {
                receiptData.purpose = 'General registration'
                return receiptData;
            }
        }
    })
}

export const getReceiptDataFromEncryptedId = (encryptedTransactionId: string) => {
    return new Promise((resolve) => {
        resolve(null)
    }).then(() => {
        return decryptData(encryptedTransactionId);
    }).then((transactionId) => {
        return getReceiptData(transactionId);
    }).catch((err) => {
        throw handleError(paymentExceptions.RECEIPT_ERROR, err.message, err);
    })
}

// export const generateReceiptPdf = (data: any) => {
//     return new Promise<object>((resolve, reject) => {
//         ejs.renderFile(path.join(__dirname,'../', 'views', 'receipt.ejs'), data, (err, html) => {
//             if(err) {
//                 reject(handleError(paymentExceptions.INVALID_DATA, 'Error generating receipt'));
//             }
//             htmlPdf.generatePdf({content: html}, {format: 'A4', printBackground: true}).then((pdfBuffer: any) => {
//                 resolve(pdfBuffer);
//             }).catch((_err: any) => {
//                 reject(_err);
//             })
//         })
//     }).catch((err) => {
//         throw handleError(paymentExceptions.RECEIPT_ERROR, err.message, err);
//     })
// }
