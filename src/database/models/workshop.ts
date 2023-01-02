import { DataTypes, Model, ModelCtor, Sequelize } from "sequelize";

import { IWorkshop } from "../../interfaces/models";

export default (sequalize: Sequelize): ModelCtor<Model<IWorkshop>> =>
    sequalize.define("workshop", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(100),
            unique: true,
            allowNull: false,
        },
        startTime: {
            type: DataTypes.DATE(),
            allowNull: false,
        },
        meetUrl:  {
            type: DataTypes.STRING(),
            allowNull: true,
        },
        capacity: {
            type: DataTypes.INTEGER(),
            allowNull: false
        },
        psgFee: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        nonPsgFee: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    },                      {
        timestamps: false,
    });
