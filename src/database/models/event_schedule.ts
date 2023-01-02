import { DataTypes, Model, ModelCtor, Sequelize } from "sequelize";

import { ISchedule } from "../../interfaces/models";

export default (sequalize: Sequelize): ModelCtor<Model<ISchedule>> => {
    return sequalize.define("event_schedule", {
       eventId: {
           type: DataTypes.INTEGER(),
           allowNull: false
       },
       startTime: {
           type: DataTypes.DATE(),
           allowNull: false
       },
       endTime: {
           type: DataTypes.DATE(),
           allowNull: false
       }
    }, {
        timestamps: false,
    })
};
