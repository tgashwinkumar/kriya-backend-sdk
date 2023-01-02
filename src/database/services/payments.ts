import { FindOptions, QueryTypes } from "sequelize";
import { PaymentTransaction, SequelizeQuery } from "..";
import { handleError, paymentExceptions, registrationExceptions } from "../../exceptions";
import { formatTransactionId } from "../../generators";
import { IPaymentTransaction } from "../../interfaces/models";


export const initializeTransaction = (kriyaId: string, email: string, name: string, type: 'E' | 'W', eventId: number, fee: number) => {

    return SequelizeQuery.query(`SELECT nextval('transaction_id_seq') as "transSeq"`, {type: QueryTypes.SELECT})
        .then(([data]: any[]) => {
            const transactionId = formatTransactionId(parseInt(data.transSeq, 10));
            return PaymentTransaction.create({
                kriyaId,
                email,
                fee,
                name,
                status: 'I',
                type,
                eventId,
                transactionId
            }).then((transaction) => {
                return transactionId;
            }).catch((err) => {
                throw handleError(paymentExceptions.TRANSACTION_CREATION, '', err, kriyaId);
            })
        }).catch((err) => {
            throw handleError(paymentExceptions.TRANSACTION_ID_ERROR, '', err, kriyaId);
        });

}

export const fetchTransactions = (where: {[key: string]: any} = {}, options:FindOptions<IPaymentTransaction> = {}) => {
    return PaymentTransaction.findAll({
        where: {
            ...where
        },
        ...options
    })
}
