import dayjs from "dayjs";
import { File } from "formidable";
import { DataTypes, Model, literal, HasManyGetAssociationsMixin, NonAttribute } from "sequelize";
import { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize/types/model";

import sequelize, { applyDateHook } from ".";
import { Album } from "./album.model";
import { User } from "./user.model";
import { Calendar } from "./calendar.model";

// -------------------------------------------- Interface ------------------------------------------ //
export interface IRequestCreate {
    // Auth Middleware User Id
    userId: number;
    userId2: number;
    cupDay: Date;
    title: string;
    thumbnail?: string | null;
}

export interface IUpdateWithController {
    userId: number;
    cupId: string;
    title?: string;
    thumbnail?: string | null;
    cupDay?: Date;
}

export type IUpdateWithService = Omit<IUpdateWithController, "userId" | "cupId">;

// -------------------------------------------- Admin ------------------------------------------ //
export interface ICoupleResponseWithCount {
    couples: Couple[];
    count: number;
}

export interface PageOptions {
    count: number;
    page: number;
    sort: string | "r" | "o" | "dr" | "do";
}

export interface SearchOptions {
    name?: string;
}

export interface FilterOptions {
    fromDate?: Date;
    toDate?: Date;
    isDeleted: boolean;
}

export interface IUpdateWithAdmin {
    cupDay?: Date;
    title?: string;
    thumbnail?: string | null;
    deleted?: boolean;
    deletedTime?: Date;
}
// ------------------------------------------ Interface End ---------------------------------------- //

export class Couple extends Model<InferAttributes<Couple>, InferCreationAttributes<Couple>> {
    /** If you use include user, You can use users field. */
    declare users?: NonAttribute<User[]>;
    /** If you use include album, You can use albums field. */
    declare albums?: NonAttribute<Album[]>;
    /** If you use include calendar, You can use calendars field. */
    declare calendars?: NonAttribute<Calendar[]>;

    declare cupId: CreationOptional<string>;
    declare cupDay: Date;
    declare title: string;
    declare thumbnail: CreationOptional<string | null>;
    declare createdTime: CreationOptional<Date>;
    declare deleted: CreationOptional<boolean>;
    declare deletedTime: CreationOptional<Date | null>;

    declare getUsers: HasManyGetAssociationsMixin<User>;
    declare getAlbums: HasManyGetAssociationsMixin<Album>;
    declare getCalendars: HasManyGetAssociationsMixin<Calendar>;
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
            type: DataTypes.STRING(200)
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

applyDateHook(Couple);
