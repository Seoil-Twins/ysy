import { DataTypes, Model, literal } from "sequelize";
import { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize/types/model";

import sequelize, { applyDateHook } from "./index.js";
import { Album } from "./album.model.js";

export class AlbumImage extends Model<InferAttributes<AlbumImage>, InferCreationAttributes<AlbumImage>> {
  declare albumImageId: CreationOptional<number>;
  declare albumId: number;
  declare size: number;
  declare type: string;
  declare path: string;
  declare createdTime: CreationOptional<Date>;
}

AlbumImage.init(
  {
    albumImageId: {
      field: "album_image_id",
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
        key: "albumId"
      }
    },
    size: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    path: {
      type: DataTypes.STRING(200),
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
    tableName: "album_image",
    timestamps: false
  }
);

applyDateHook(AlbumImage);
