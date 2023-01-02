import moment from "moment-timezone";

import { createEventRegistration, findAllEvents, findEventById, findEventRegistration } from "../database/services/event";
import { handleError, joinExceptions } from "../exceptions";
import { sendEventRegistrationMail } from "../messaging/mailer";

/**
 * Registers user for an event
 * No validation for payments is included
 * @param kriyaId Kriya ID
 * @param eventId Event Id
 */
export const registerEventUsingKriyaId = (kriyaId: string, eventId: number) => {

    return createEventRegistration(kriyaId, eventId).then((e) => {
        sendEventRegistrationMail(kriyaId, eventId);
        return e;
    });

};

/**
 * List all events from database
 */
export const listEvents = () => {
    return findAllEvents()
        .then((events) => events.map((e) => e.toJSON()));
};

/**
 * Fetches meeting URL for specific event
 * @param eventId Event Id
 */
export const getEventUrlById = (eventId: number) =>
    findEventById(eventId, {include: ["meetUrl", "startTime"]})
        .then((event) => {
            const meetUrl = event.getDataValue("meetUrl");
            const startTime = event.getDataValue("startTime");
            if (!meetUrl) {
                throw handleError(joinExceptions.EVENT_ERROR, "Meeting not published yet", {}, `E-${eventId}`);
            } else {
                if (new Date() > new Date(startTime)) {
                    return {
                        url: meetUrl,
                        startTime,
                    };
                } else {
                    throw handleError(joinExceptions.EVENT_NOT_STARTED, "Event not started yet", {}, `E-${eventId}`);
                }
            }
        });


export const checkEventRegistration = (kriyaId: string, eventId: number) => {

    return findEventRegistration(kriyaId, eventId).then((reg) => {
        if(reg) {
            return true;
        } else {
            return false;
        }
    })

}