import { DataTypes, Model, literal, HasManyGetAssociationsMixin } from "sequelize";
import { File } from "formidable";

import sequelize from ".";
import { Album } from "./album.model";
import { User } from "./user.model";

// -------------------------------------------- Interface ------------------------------------------ //
export interface ICouple {
    cupId: string;
    cupDay: Date;
    title: string;
    thumbnail: string | null;
    createdTime: Date;
    deleted: boolean;
    deletedTime: Date | null;
}

export interface IRequestCreate {
    // Auth Middleware User Id
    userId: number;
    userId2: number;
    cupDay: Date;
    title: string;
    thumbnail?: File;
}

export interface IRequestUpdate {
    userId: number;
    cupId: string;
    title: string | undefined;
    thumbnail: File | undefined;
    cupDay: Date | undefined;
}

interface ICreate {
    cupId: string;
    cupDay: Date;
    title: string;
    thumbnail: string | null;
}
// ------------------------------------------ Interface End ---------------------------------------- //

export class Couple extends Model<ICouple, ICreate> {
    declare cupId: string;
    declare cupDay: Date;
    declare title: string;
    declare thumbnail: string | null;
    declare deleted: boolean;
    declare deletedTime: Date | null;

    declare getUsers: HasManyGetAssociationsMixin<User>;
    declare getAlbums: HasManyGetAssociationsMixin<Album>;
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
            type: DataTypes.STRING(60)
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
