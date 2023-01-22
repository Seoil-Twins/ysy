import { DataTypes, Model, literal } from "sequelize";
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

export interface IRequestCreate {
    cupId: string;
    title: string;
}

export interface IRequestUpadte {
    cupId: string;
    title: string | undefined;
    thumbnail: File | undefined;
}

interface ICreate {
    cupId: string;
    title: string;
}
// ------------------------------------------ Interface End ---------------------------------------- //

export class Album extends Model<IAlbum, ICreate> {
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
