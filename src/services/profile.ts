import parseDataURL from "data-urls";
import { extension } from "mime-types";
import { EventRegistration, Profile, Workshop, WorkshopRegistration, Event, PaymentTransaction, EventSchedule, WorkshopSchedule } from "../database";
import moment from 'moment-timezone';
import { createUserProfile, findUserByKriyaId, updateUserByKriyaId } from "../database/services/user";
import { handleError, StorageExceptions } from "../exceptions";
import { IProfile } from "../interfaces/models";
import { readFileFromBucket, uploadFileToBucket } from "../storage";

const mapSchedules = (schedules: any) => schedules.map((slot: any) => {
    const startTime = moment(new Date(slot.startTime)).tz('Asia/Kolkata');
    const endTime = moment(new Date(slot.endTime)).tz('Asia/Kolkata');

    return {
        date: startTime.format('DD/MM/yyyy'),
        startTime: startTime.format('hh:mm A'),
        endTime: endTime.format('hh:mm A')
    }
})

/**
 * Updates attributes for specific file in database
 * @param kriyaId Kriya ID
 * @param updateObj Attributes to be updated
 */
export const updateProfile = (kriyaId: string, updateObj: {[key: string]: string}) => {

    const restrictedFields = ["id", "email", "firebaseUId"];

    const toBeUpdated = Object.entries(updateObj)
        .filter(([key, val]) => !restrictedFields.includes(key))
        .reduce((obj, [key, val]) =>
            ({...obj, [key]: val}),      {});

    return updateUserByKriyaId(kriyaId, toBeUpdated);
};

export const createProfile = (kriyaId: string, profile: IProfile) => {
    return createUserProfile(kriyaId, profile);
};

/**
 * Uploads image to Storage creating a folder for specific kriya Id and storring files under them
 * @param kriyaId Kriya ID
 * @param key Unique key (eg. front, back)
 * @param dataURL File content as base64 encoded data url
 */
export const uploadIdImage = (kriyaId: string, key: string, dataURL: string) => {

    const content = parseDataURL(dataURL);
    if (content) {
        const fileKey = `${kriyaId}/${key}.${extension(content.mimeType.toString())}`;

        return uploadFileToBucket(fileKey, content.mimeType.toString(), content.body);
    } else {
        return new Promise((resolve, reject) => reject(handleError(StorageExceptions.INVALID_CONTENT, "File content is deformed", {}, kriyaId)));
    }

};

/**
 * Reads a file from storage
 * @param kriyaId Kriya Id
 * @param key Unique key (eg. front, back)
 */
export const readIdImage = (kriyaId: string, key: string) => {
    return readFileFromBucket(`${kriyaId}/${key}`);
}


export const fetchProfile = (kriyaId: string) => {
    return findUserByKriyaId(kriyaId, {
        attributes: ["kriyaId", "email"],
        include: [{
            as: "profile",
            model: Profile,
            attributes: {exclude: ["id", "kriyaId"]},
        },        {
            as: "transactions",
            model: PaymentTransaction,
            where: {
                kriyaId,
                status: 'S',
                type: 'E'
            },
            attributes: [["updatedAt", "paidOn"]],
            required: false
        },        {
            as: "eventRegistrations",
            model: EventRegistration,
            attributes: [["eventId", "id"]],
            include: [{
                as: "details",
                model: Event,
                attributes: ["name", "category", "teamUrl"],
                include: [{
                    as: "schedules",
                    model: EventSchedule,
                    attributes: ["startTime", "endTime"]
                }]
            }],
        },        {
            as: "workshopRegistrations",
            model: WorkshopRegistration,
            attributes: [["workshopId", "id"]],
            include: [{
                as: "details",
                model: Workshop,
                attributes: ["name"],
                include: [{
                    as: "schedules",
                    model: WorkshopSchedule,
                    attributes: ["startTime", "endTime"]
                }]
            }],
        }]
    }).then((model) => {
        const profile: any = model.toJSON();
        profile.generalRegistration = profile.transactions.length !== 0;

        profile.eventRegistrations = profile.eventRegistrations.map((reg: any) => {
            reg.details.schedules = mapSchedules(reg.details.schedules);
            return {
                id: reg.id,
                ...reg.details
            }
        })
        profile.workshopRegistrations = profile.workshopRegistrations.map((reg: any) => {
            reg.details.schedules = mapSchedules(reg.details.schedules);
            return {
                id: reg.id,
                ...reg.details
            }
        })
        delete profile.transactions;
        return profile
    })
}
export {
    findUserByKriyaId,
};
