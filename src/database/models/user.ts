import { DataTypes, Model, ModelCtor, Sequelize } from "sequelize";

import { IUser } from "../../interfaces/models";

export default (sequalize: Sequelize): ModelCtor<Model<IUser>> =>
    sequalize.define("user", {
        kriyaId: {
            primaryKey: true,
            type: DataTypes.STRING(10),
        },
        firebaseUId: {
            type: DataTypes.STRING(50),
            unique: true,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(100),
            unique: true,
            allowNull: false,
        },
    });
