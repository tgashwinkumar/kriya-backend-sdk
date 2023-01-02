import { DataTypes, Model, ModelCtor, Sequelize } from "sequelize";

import { User, Workshop } from "..";
import { IWorkshopRegistration } from "../../interfaces/models";

export default (sequalize: Sequelize): ModelCtor<Model<IWorkshopRegistration>> =>
    sequalize.define("workshop_registration", {
        kriyaId: {
            type: DataTypes.STRING(10),
            references: {
                model: User,
                key: "kriyaId",
            },
        },
        workshopId: {
            type: DataTypes.INTEGER(),
            references: {
                model: Workshop,
                key: "id",
            },
        }
    },                      {
        timestamps: false
    });
