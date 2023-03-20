import dayjs from "dayjs";
import { DataTypes, Model, literal, NonAttribute } from "sequelize";
import { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize/types/model";

import sequelize, { applyDateHook } from ".";
import { Couple } from "./couple.model";

// -------------------------------------------- Interface ------------------------------------------ //
export interface ICreate {
    cupId: string;
    title: string;
    description: string;
    fromDate: Date;
    toDate: Date;
    color: string;
}

export interface IResponse {
    cupId: string;
    calendars: Calendar[];
}

export interface IUpdate {
    cupId: string;
    title?: string;
    description?: string;
    fromDate?: Date;
    toDate?: Date;
    color?: string;
}
// ------------------------------------------ Interface End ---------------------------------------- //

export class Calendar extends Model<InferAttributes<Calendar>, InferCreationAttributes<Calendar>> {
    /** If you use include couple, You can use couple field. */
    declare couple?: NonAttribute<Couple>;

    declare calendarId: CreationOptional<number>;
    declare cupId: string;
    declare title: string;
    declare description: string;
    declare fromDate: Date;
    declare toDate: Date;
    declare color: string;
    declare createdTime: CreationOptional<Date>;
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
        fromDate: {
            field: "from_date",
            type: DataTypes.DATE,
            allowNull: false
        },
        toDate: {
            field: "to_date",
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

applyDateHook(Calendar);
