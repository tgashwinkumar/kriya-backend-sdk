import { Sequelize } from "sequelize";

import { DatabaseExceptions, handleError } from "../exceptions";
import { IEvent, IUser, IWorkshop } from "../interfaces/models";
import { DatabaseLogCodes, log } from "../logger";

import getSequalizeConnection from "./connection";
import EventModel from "./models/event";
import EventRegistrationModel from "./models/event_registration";
import LogModel from "./models/logs";
import ProfileModel from "./models/profile";
import UserModel from "./models/user";
import WorkshopModel from "./models/workshop";
import WorkshopRegistrationModel from "./models/workshop_registration";
import PaymentTransactionModel from "./models/payment_transaction";
import EventScheduleModel from "./models/event_schedule";
import WorkshopScheduleModel from "./models/workshop_schedule";

/**
 * Force syncs database tables
 * @param seq Sequelize Object
 */
const syncDatabase = async (seq: Sequelize) => {
    log(false, DatabaseLogCodes.SYNC, "system", "Start sync");
    const sync = await seq.sync({force: true});
    seq.getQueryInterface().addConstraint("event_registrations", {
        type: "unique",
        name: "unique_event_registration",
        fields: ["kriyaId", "eventId"],
    });
    seq.getQueryInterface().addConstraint("workshop_registrations", {
        type: "unique",
        name: "unique_workshop_registration",
        fields: ["kriyaId", "workshopId"],
    });
    log(false, DatabaseLogCodes.SYNC, "system", "Sync complete");
};

const sequalize: Sequelize = getSequalizeConnection();

const Event = EventModel(sequalize);
const User = UserModel(sequalize);
const Profile = ProfileModel(sequalize);
const EventRegistration = EventRegistrationModel(sequalize);
const Workshop = WorkshopModel(sequalize);
const WorkshopRegistration = WorkshopRegistrationModel(sequalize);
const Log = LogModel(sequalize);
const PaymentTransaction = PaymentTransactionModel(sequalize);
const EventSchedule = EventScheduleModel(sequalize);
const WorkshopSchedule = WorkshopScheduleModel(sequalize);

// Associations
User.hasOne(Profile, { as: "profile", foreignKey: "kriyaId" });
User.hasMany(EventRegistration, { as: "eventRegistrations", foreignKey: "kriyaId" });
User.hasMany(WorkshopRegistration, { as: "workshopRegistrations", foreignKey: "kriyaId"});
User.hasMany(PaymentTransaction, { as: "transactions", foreignKey: "kriyaId" })

EventRegistration.belongsTo(Event, { as: "details", foreignKey: "eventId" });
WorkshopRegistration.belongsTo(Workshop, { as: "details", foreignKey: "workshopId" });

Event.hasMany(EventSchedule, { as: 'schedules', foreignKey: 'eventId'});
Workshop.hasMany(WorkshopSchedule, { as: 'schedules', foreignKey: 'eventId'});

sequalize.authenticate().then(async () => {
    log(false, DatabaseLogCodes.AUTHENTICATE, "system", "Connection established");
    if (process.env.DB_SYNC === "Y") {
        syncDatabase(sequalize);
    }
}).catch((err) => {
    handleError(DatabaseExceptions.ERROR, err.message, err);
});

export const SequelizeQuery = sequalize;

export {
    Event,
    User,
    Profile,
    Workshop,
    EventRegistration,
    WorkshopRegistration,
    Log,
    PaymentTransaction,
    EventSchedule,
    WorkshopSchedule,
    IEvent,
    IUser,
    IWorkshop,
};
