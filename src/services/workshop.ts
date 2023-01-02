import { createWorkshopRegistration, findAllWorkshops, findWorkshopById, findWorkshopRegistration } from "../database/services/workshop";
import { handleError, joinExceptions, registrationExceptions } from "../exceptions";
import { currentTimestamp } from "../generators";
import moment from 'moment-timezone';
import { PaymentTransaction } from "../database";
import { Op } from "sequelize";

/**
 * Registers user for a workshop
 * @param kriyaId Kriya Id
 * @param workshopId Workshop Id
 */
export const registerWorkshopUsingKriyaId = (kriyaId: string, workshopId: number) => {

    const ts = currentTimestamp();

    return createWorkshopRegistration(kriyaId, workshopId);

};

/**
 * List all workshops in database
 */
export const listWorkshops = () => {
    return findAllWorkshops()
        .then((workshops) => workshops.map((w) => w.toJSON()));
}

export const checkWorkshopAvailability = (workshopId: number) => {
    return findWorkshopById(workshopId, ["capacity"]).then((workshop) => {
        const capacity = workshop.getDataValue("capacity");
        const paymentAfter = moment().tz("Asia/Kolkata").subtract(30, "minutes");
        return PaymentTransaction.findAndCountAll({
            where: {
                [Op.and]: [
                    {eventId: workshopId},
                    {[Op.or]: [
                        {status: 'S'},
                        {[Op.and]: [
                            {status: 'I'},
                            {createdAt: {
                                [Op.gt]: paymentAfter.toISOString()
                            }}
                        ]}
                    ]}
                ]
            }
        }).then((result) => {
            return {
                count: result.count,
                capacity
            };
        })
    })
}


export const checkWorkshopRegistration = (kriyaId: string, workshopId: number) => {
    return findWorkshopRegistration(kriyaId, workshopId).then((reg) => {
        if(reg) {
            return new Promise((resolve) => resolve({registered: true}));
        } else {
            return checkWorkshopAvailability(workshopId).then(({count, capacity}) => {
                return {
                    registered: false,
                    available: capacity > count,
                    seatsAvailable: capacity-count
                }
            });
        }
    })
}

export const getWorkshopUrlById = (kriyaId: string, workshopId: number) => {
    return checkWorkshopRegistration(kriyaId, workshopId)
    .then((resp: any) => {
        return resp.registered;
    })
    .then((registered) => {
        if(!registered) {
            throw handleError(registrationExceptions.WORKSHOP_NOT_REGISTERED, "Workshop is not registered", {}, `${kriyaId};`)
        } else {
            return findWorkshopById(workshopId, {include: ["meetUrl", "startTime"]}).then((event) => {
                const meetUrl = event.getDataValue("meetUrl");
                const startTime = event.getDataValue("startTime");
                if (!meetUrl) {
                    throw handleError(joinExceptions.WORKSHOP_ERROR, "Meeting not published yet", {}, `W-${workshopId}`);
                } else {
                    if (moment().tz("Asia/Kolkata").toDate() > new Date(startTime)) {
                        return {
                            url: meetUrl,
                            startTime,
                        };
                    } else {
                        throw handleError(joinExceptions.WORKHOP_NOT_STARTED, "Workshop not started yet", {}, `W-${workshopId}`);
                    }
                }
            });
        }
    });
}
