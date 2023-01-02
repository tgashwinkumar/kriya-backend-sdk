import { DataTypes, Model, ModelCtor, Sequelize } from "sequelize";

import { Event, User } from "..";
import { IEventRegistration } from "../../interfaces/models";

export default (sequalize: Sequelize): ModelCtor<Model<IEventRegistration>> =>
    sequalize.define("event_registration", {
        kriyaId: {
            type: DataTypes.STRING(10),
            references: {
                model: User,
                key: "kriyaId",
            },
        },
        eventId: {
            type: DataTypes.INTEGER(),
            references: {
                model: Event,
                key: "id",
            },
        },
    },                      {
        timestamps: true,
        createdAt: true,
        updatedAt: false,
    });
