import { DataTypes, Model, literal } from "sequelize";

import sequelize from ".";

// -------------------------------------------- Interface ------------------------------------------ //
export interface ICouple {
    cupId: string;
    cupDay: Date;
    title: string;
    thumbnail: string;
    createdTime: Date;
    deleted: boolean;
    deletedTime: Date | null;
}

export interface IRequestData {
    // Auth Middleware User Id
    userId: number;
    userId2: number;
    cupDay: Date;
    title: string;
    thumbnail: string;
}

interface ICreateData {
    cupId: string;
    cupDay: Date;
    title: string;
    thumbnail: string;
}
// ------------------------------------------ Interface End ---------------------------------------- //

export class Couple extends Model<ICouple, ICreateData> {
    declare cupId: string | null;
    declare cupDay: Date;
    declare title: string;
    declare thumbnail: string;
    declare deleted: boolean;
    declare deletedTime: Date | null;
}

Couple.init(
    {
        cupId: {
            field: "cup_id",
            type: DataTypes.STRING(8),
            primaryKey: true
        },
        cupDay: {
            field: "cup_day",
            type: DataTypes.DATE,
            allowNull: false
        },
        title: {
            type: DataTypes.STRING(15),
            allowNull: false
        },
        thumbnail: {
            type: DataTypes.STRING(30),
            allowNull: false
        },
        createdTime: {
            field: "created_time",
            type: "TIMESTAMP",
            defaultValue: literal("CURRENT_TIMESTAMP")
        },
        deleted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        deletedTime: {
            field: "deleted_time",
            type: "TIMESTAMP"
        }
    },
    {
        sequelize: sequelize,
        tableName: "couple",
        timestamps: false
    }
);
