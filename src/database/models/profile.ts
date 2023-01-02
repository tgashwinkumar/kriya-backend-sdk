import { DataTypes, Model, ModelCtor, Sequelize } from "sequelize";

import { User } from "..";
import { IProfile } from "../../interfaces/models";

export default (sequalize: Sequelize): ModelCtor<Model<IProfile>> =>
    sequalize.define("profile", {
        kriyaId: {
            type: DataTypes.STRING(10),
            primaryKey: true,
            references: {
                model: User,
                key: "kriyaId",
            },
        },
        fullName: {
            type: DataTypes.STRING(100),
            allowNull: false,
            defaultValue: "",
        },
        isPSGStudent: {
            type: DataTypes.STRING(1),
            defaultValue: "N",
            allowNull: false,
        },
        college: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
        },
        rollNo: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        department: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        year: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        dob: {
            type: DataTypes.DATE(),
            allowNull: false,
        },
        phone: {
            type: DataTypes.STRING(12),
            allowNull: false,
        },
        alternatePhone: {
            type: DataTypes.STRING(12),
            allowNull: true,
            defaultValue: "",
        },
        interestedSubject: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "",
        },
    },                      {
        timestamps: false,
    });
