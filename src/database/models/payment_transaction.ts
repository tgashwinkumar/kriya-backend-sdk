import { DataTypes, Model } from "sequelize";
import { ModelCtor, Sequelize } from "sequelize";
import { User } from "..";
import { IPaymentTransaction } from "../../interfaces/models";

export default (sequelize: Sequelize): ModelCtor<Model<IPaymentTransaction>> => {

    return sequelize.define("payment_transaction", {
        transactionId: {
            type: DataTypes.STRING(12),
            primaryKey: true
        },
        kriyaId: {
            type: DataTypes.STRING(10),
            allowNull: false,
            references: {
                model: User,
                key: "kriyaId"
            }
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            references: {
                model: User,
                key: "email"
            }
        },
        type: {
            type: DataTypes.STRING(1),
            allowNull: false
        },
        eventId: {
            type: DataTypes.INTEGER(),
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(),
            allowNull: true,
            defaultValue: ''
        },
        fee: {
            type: DataTypes.INTEGER(),
            allowNull: false
        },
        status: {
            type: DataTypes.STRING(1),
            allowNull: false,
            defaultValue: 'I'
        }
    })

}