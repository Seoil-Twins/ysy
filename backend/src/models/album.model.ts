import { DataTypes, Model, literal, NonAttribute, HasManyGetAssociationsMixin } from "sequelize";
import { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize/types/model";

import sequelize, { applyDateHook } from ".";
import { AlbumImage } from "./albnmImage.model";
import { Couple } from "./couple.model";

export class Album extends Model<InferAttributes<Album>, InferCreationAttributes<Album>> {
  /** If you use include inquireImage, You can use inquireImages field. */
  declare albumImages?: NonAttribute<AlbumImage[]>;
  /** If you use include couple, You can use couple field. */
  declare couple?: NonAttribute<Couple>;

  declare albumId: CreationOptional<number>;
  declare cupId: string;
  declare title: string;
  declare thumbnail: CreationOptional<string | null>;
  declare createdTime: CreationOptional<Date>;

  declare getAlbumImages: HasManyGetAssociationsMixin<AlbumImage>;
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
      type: DataTypes.CHAR(8),
      allowNull: false,
      references: {
        model: Couple,
        key: "cupId"
      }
    },
    title: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    thumbnail: {
      type: DataTypes.STRING(200)
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

applyDateHook(Album);
