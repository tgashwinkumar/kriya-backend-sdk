import { DataTypes, Model, ModelCtor, Sequelize } from "sequelize";

import { IEvent } from "../../interfaces/models";

export default (sequalize: Sequelize): ModelCtor<Model<IEvent>> =>
    sequalize.define("event", {
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
        category: {
            type: DataTypes.STRING(1),
            allowNull: false
        },
        startTime: {
            type: DataTypes.DATE(),
            allowNull: false,
        },
        teamUrl: {
            type: DataTypes.STRING(),
            allowNull: true
        },
        meetUrl: {
            type: DataTypes.STRING(),
            allowNull: true,
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
