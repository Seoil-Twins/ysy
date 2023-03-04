import dayjs from "dayjs";
import { DataTypes, Model, literal } from "sequelize";
import { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize/types/model";

import sequelize from ".";
import { Album } from "./album.model";

// -------------------------------------------- Interface ------------------------------------------ //
// ------------------------------------------ Interface End ---------------------------------------- //

export class AlbumImage extends Model<InferAttributes<AlbumImage>, InferCreationAttributes<AlbumImage>> {
    declare imageId: CreationOptional<number>;
    declare albumId: number;
    declare image: string;
    declare createdTime: CreationOptional<Date>;
}

AlbumImage.init(
    {
        imageId: {
            field: "image_id",
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        albumId: {
            field: "album_id",
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: Album,
                key: "album_id"
            }
        },
        image: {
            type: DataTypes.STRING(60),
            allowNull: false
        },
        createdTime: {
            field: "created_time",
            type: "TIMESTAMP",
            defaultValue: literal("CURRENT_TIMESTAMP"),
            get(this: AlbumImage): string | null {
                const date = dayjs(this.getDataValue("createdTime"));
                const formatDate = date.format("YYYY-MM-DD HH:mm:ss");

                return date.isValid() ? formatDate : null;
            }
        }
    },
    {
        sequelize: sequelize,
        tableName: "album_image",
        timestamps: false
    }
);
