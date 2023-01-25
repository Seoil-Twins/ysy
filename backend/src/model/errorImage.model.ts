import { DataTypes, Model, literal } from "sequelize";

import sequelize from ".";

// -------------------------------------------- Interface ------------------------------------------ //
export interface IErrorImage {
    errorId: number;
    albumId: number;
    thumbnail: string;
    createdTime: Date;
}

interface ICreate {
    albumId: number;
    thumbnail: string;
}
// ------------------------------------------ Interface End ---------------------------------------- //

export class ErrorImage extends Model<IErrorImage, ICreate> {
    declare albumId: number;
    declare thumbnail: string;
}

ErrorImage.init(
    {
        errorId: {
            field: "error_id",
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        albumId: {
            field: "album_id",
            type: DataTypes.INTEGER.UNSIGNED,
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
        tableName: "error_image",
        timestamps: false
    }
);
