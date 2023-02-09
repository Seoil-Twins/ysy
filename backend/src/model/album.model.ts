import { DataTypes, Model, literal, NonAttribute } from "sequelize";
import { File } from "formidable";

import sequelize from ".";
import { Couple } from "./couple.model";

// -------------------------------------------- Interface ------------------------------------------ //
export interface IAlbum {
    albumId: number;
    cupId: string;
    title: string;
    thumbnail: string | null;
    createdTime: Date;
}

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
// ------------------------------------------ Interface End ---------------------------------------- //

export class Album extends Model<IAlbum, ICreate> {
    /** If you use include couple, You can use couple field. */
    declare couple?: NonAttribute<Couple>;

    declare albumId: number;
    declare cupId: string;
    declare title: string;
    declare thumbnail: string | null;
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
            defaultValue: literal("CURRENT_TIMESTAMP")
        }
    },
    {
        sequelize: sequelize,
        tableName: "album",
        timestamps: false
    }
);
