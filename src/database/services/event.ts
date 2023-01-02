import { Op } from "sequelize";
import { Model } from "sequelize/types";

import { Event, EventRegistration, IEvent } from "../../database";
import { EventsExceptions, handleError, registrationExceptions } from "../../exceptions";

/**
 * Fetches Event model based on id
 * @param eventId Event Id
 */
export const findEventById = (eventId: number, attributes: any = { exclude: ["meetUrl"] }): Promise<Model<IEvent>> => {

    // Filter out Meeting URL and retrieve other info
    return Event.findByPk(eventId, {
        attributes,
    }).then((event) => {
        if (event) {
            return event;
        } else {
            throw handleError(EventsExceptions.NOT_FOUND, "Invalid Event Id", {}, `E-${eventId}`);
        }
    }).catch((err) => {
        throw handleError(EventsExceptions.ERROR_READING, "", err, `E-${eventId}`);
    });

};

/**
 * Fetches list of event models with id and name alone
 */
export const findAllEvents = (attributes: string[] = ["id", "name", "startTime"]) => {
    return Event.findAll({
        attributes,
    }).catch((err) => {
        throw handleError(EventsExceptions.ERROR_READING, "", err);
    });
};

/**
 * Registers the participant for an event
 * @param kriyaId Kriya Id
 * @param eventId Event Id in reference to the event table
 */
export const createEventRegistration = (kriyaId: string, eventId: number) =>
    EventRegistration.create({
        kriyaId,
        eventId,
    }).catch((err) => {
        if (err.name && err.name === "SequelizeUniqueConstraintError") {
            throw handleError(registrationExceptions.EVENT_DUPLICATE, "", err, `${kriyaId};E-${eventId}`);
        }
        throw handleError(registrationExceptions.EVENT_ERROR, "", err, `${kriyaId};E-${eventId}`);
    });


export const findEventRegistration = (kriyaId: string, eventId: number) => {
    return EventRegistration.findOne({
        where: {
            [Op.and]: [
                {eventId: eventId},
                {kriyaId: kriyaId}
            ]
        }
    }).catch((err) => {
        throw handleError(EventsExceptions.ERROR_READING, "", err, `${kriyaId};E-${eventId}`);
    });
}
