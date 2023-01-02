import { Op } from "sequelize";
import { Model } from "sequelize/types";

import { IWorkshop, Workshop, WorkshopRegistration } from "../../database";
import { handleError, registrationExceptions, WorkshopsException } from "../../exceptions";
import { sendWorkshopRegistrationMail } from "../../messaging/mailer";

/**
 * Fetches Workshop model based on id
 * @param {number} workshopId Workshop Id
 */
export const findWorkshopById = (workshopId: number, attributes: any = { exclude: ["meetUrl"] }): Promise<Model<IWorkshop>> => {
    return Workshop.findByPk(workshopId, {
        attributes,
    }).then((workshop) => {
        if (workshop) {
            return workshop;
        } else {
            throw handleError(WorkshopsException.NOT_FOUND, "Invalid Workshop Id", {}, `W-${workshopId}`);
        }
    }).catch((err) => {
        throw handleError(WorkshopsException.ERROR_READING, "", err, `W-${workshopId}`);
    });
};

/**
 * Fetches list of workshop models with id, name and price
 */
export const findAllWorkshops = () => {
    return Workshop.findAll({
        attributes: ["id", "name", "startTime", "psgFee", "nonPsgFee"],
    }).catch((err) => {
        throw handleError(WorkshopsException.ERROR_READING, "", err);
    });
};

/**
 * Registers participant for a workshop
 * @param kriyaId Kriya Id
 * @param workshopId Workshop Id in reference to table
 * @param paidOn timestamp
 */
export const createWorkshopRegistration = (kriyaId: string, workshopId: number) =>
    WorkshopRegistration.create({
        kriyaId,
        workshopId
    }).then((wrkshop) => {
        sendWorkshopRegistrationMail(kriyaId, workshopId);
        return wrkshop;
    }).catch((err) => {
        if (err.name && err.name === "SequelizeUniqueConstraintError") {
            throw handleError(registrationExceptions.WORKSHOP_DUPLICATE, "", err, `${kriyaId};W-${workshopId}`);
        }
        throw handleError(registrationExceptions.WORKSHOP_ERROR, "", err, `${kriyaId};W-${workshopId}`);
    });


export const findWorkshopRegistration = (kriyaId: string, workshopId: number) => {
    return WorkshopRegistration.findOne({
        where: {
            [Op.and]: [
                {workshopId: workshopId},
                {kriyaId: kriyaId}
            ]
        }
    }).catch((err) => {
        throw handleError(WorkshopsException.ERROR_READING, "", err, `${kriyaId};W-${workshopId}`);
    });
}
