import { DataTypes, Model, literal } from "sequelize";

import sequelize from ".";
import { Couple } from "./couple.model";

// -------------------------------------------- Interface ------------------------------------------ //
export interface ICalendar {
    calendarId: number;
    cupId: string;
    title: string;
    description: string;
    fromTime: Date;
    toTime: Date;
    color: Date;
    createdTime: Date;
}

export interface ICreate {
    cupId: string;
    title: string;
    description: string;
    fromTime: Date;
    toTime: Date;
    color: Date;
}
// ------------------------------------------ Interface End ---------------------------------------- //

export class Calendar extends Model<ICalendar, ICreate> {
    declare calendarId: number;
    declare cupId: string;
    declare title: string;
    declare description: string;
    declare fromTime: Date;
    declare toTime: Date;
    declare color: string;
}

Calendar.init(
    {
        calendarId: {
            field: "calendar_id",
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        cupId: {
            field: "cup_id",
            type: DataTypes.STRING(8),
            allowNull: false,
            references: {
                model: Couple,
                key: "cupId"
            }
        },
        title: {
            type: DataTypes.STRING(15),
            allowNull: false
        },
        description: {
            type: DataTypes.STRING(60),
            allowNull: false
        },
        fromTime: {
            field: "from_time",
            type: DataTypes.DATE,
            allowNull: false
        },
        toTime: {
            field: "to_time",
            type: DataTypes.DATE,
            allowNull: false
        },
        color: {
            type: DataTypes.STRING(7),
            allowNull: false
        },
        createdTime: {
            field: "created_time",
            type: "TIMESTAMP",
            defaultValue: literal("CURRENT_TIMESTAMP")
        }
    },
    {
        sequelize: sequelize,
        tableName: "calendar",
        timestamps: false
    }
);
