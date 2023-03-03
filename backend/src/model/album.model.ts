import dayjs from "dayjs";
import { File } from "formidable";
import { DataTypes, Model, literal, NonAttribute } from "sequelize";
import { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize/types/model";

import sequelize from ".";
import { Couple } from "./couple.model";
// -------------------------------------------- Interface ------------------------------------------ //
export interface ICreate {
    cupId: string;
    title: string;
}

export interface IRequestGet {
    albumId: number;
    cupId: string;
    count: number;
    nextPageToken?: string;
}

export interface IRequestUpadteTitle {
    userId: number;
    cupId: string;
    albumId: number;
    title: string;
}

export interface IRequestUpadteThumbnail {
    userId: number;
    cupId: string;
    albumId: number;
    thumbnail: File;
}

export interface IResponse {
    albumId: number;
    cupId: string;
    title: string;
    thumbnail: string | null;
    createdTime: Date;
    items: string[];
    nextPageToken?: string;
}
// -------------------------------------------- Admin ------------------------------------------ //
export interface IAlbumResponseWithCount {
    albums: Album[];
    count: number;
}

export interface PageOptions {
    count: number;
    page: number;
    sort: string | "r" | "o" | "cd" | "ca";
}

export interface SearchOptions {
    cupId?: string;
}

export interface FilterOptions {
    fromDate?: Date;
    toDate?: Date;
}

export interface IUpdate {
    title?: string;
    thumbnail: string;
}
// ------------------------------------------ Interface End ---------------------------------------- //

export class Album extends Model<InferAttributes<Album>, InferCreationAttributes<Album>> {
    /** If you use include couple, You can use couple field. */
    declare couple?: NonAttribute<Couple>;

    declare albumId: CreationOptional<number>;
    declare cupId: string;
    declare title: string;
    declare thumbnail: CreationOptional<string | null>;
    declare createdTime: CreationOptional<Date>;
}

Album.init(
    {
        albumId: {
            field: "album_id",
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
        thumbnail: {
            type: DataTypes.STRING(60)
        },
        createdTime: {
            field: "created_time",
            type: "TIMESTAMP",
            defaultValue: literal("CURRENT_TIMESTAMP"),
            get(this: Album): string | null {
                const date = dayjs(this.getDataValue("createdTime"));
                const formatDate = date.format("YYYY-MM-DD HH:mm:ss");

                return date.isValid() ? formatDate : null;
            }
        }
    },
    {
        sequelize: sequelize,
        tableName: "album",
        timestamps: false
    }
);
