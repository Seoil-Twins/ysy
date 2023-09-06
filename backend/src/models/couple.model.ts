import { DataTypes, Model, literal, HasManyGetAssociationsMixin, NonAttribute } from "sequelize";
import { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize/types/model";

import sequelize, { applyDateHook } from ".";
import { Album } from "./album.model";
import { User } from "./user.model";
import { Calendar } from "./calendar.model";

export class Couple extends Model<InferAttributes<Couple>, InferCreationAttributes<Couple>> {
  /** If you use include user, You can use users field. */
  declare users?: NonAttribute<User[]>;
  /** If you use include album, You can use albums field. */
  declare albums?: NonAttribute<Album[]>;
  /** If you use include calendar, You can use calendars field. */
  declare calendars?: NonAttribute<Calendar[]>;

  declare cupId: CreationOptional<string>;
  declare cupDay: Date;
  declare thumbnail: CreationOptional<string | null>;
  declare thumbnailSize: CreationOptional<number | null>;
  declare thumbnailType: CreationOptional<string | null>;
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
      type: DataTypes.CHAR(8),
      primaryKey: true
    },
    cupDay: {
      field: "cup_day",
      type: DataTypes.DATE,
      allowNull: false
    },
    thumbnail: {
      type: DataTypes.STRING(200)
    },
    thumbnailSize: {
      field: "thumbnail_size",
      type: DataTypes.INTEGER.UNSIGNED
    },
    thumbnailType: {
      field: "thumbnail_type",
      type: DataTypes.STRING(20)
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
