import { DataTypes, Model, ModelCtor, Sequelize } from "sequelize";

import { ILogs } from "../../interfaces/models";

export default (sequalize: Sequelize): ModelCtor<Model<ILogs>> =>
    sequalize.define("log", {
        user: {
            type: DataTypes.STRING(),
            allowNull: true,
        },
        isError: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        code: {
            type: DataTypes.STRING(),
            allowNull: true,
        },
        message: {
            type: DataTypes.TEXT(),
            allowNull: true,
        },
    },                      {
        createdAt: true,
        updatedAt: false,
    });
