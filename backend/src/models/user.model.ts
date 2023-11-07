import { DataTypes, Model, literal, NonAttribute, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";

import sequelize, { applyDateHook } from "./index.js";
import { Couple } from "./couple.model.js";
import { Inquiry } from "./inquiry.model.js";
import { UserRole } from "./userRole.model.js";
import { Admin } from "./admin.model.js";

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  /** If you use include couple, You can use couple field. */
  declare couple?: NonAttribute<Couple>;
  /** If you use include inquiry, You can use inquire field. */
  declare inquires?: NonAttribute<Inquiry[]>;
  /** If you use include userRole, You can use inquire field. */
  declare userRole?: NonAttribute<UserRole>;
  /** If you use include admin, You can use inquire field. */
  declare admin?: NonAttribute<Admin>;

  declare userId: CreationOptional<number>;
  declare cupId: CreationOptional<string | null>;
  declare snsId: string;
  declare snsKind: string;
  declare email: string;
  declare name: string;
  declare code: string;
  declare birthday: Date;
  declare phone: string;
  declare profile: CreationOptional<string | null>;
  declare profileSize: CreationOptional<number | null>;
  declare profileType: CreationOptional<string | null>;
  declare primaryNofi: CreationOptional<boolean>;
  declare dateNofi: CreationOptional<boolean>;
  declare eventNofi: CreationOptional<boolean>;
  declare coupleNofi: CreationOptional<boolean>;
  declare albumNofi: CreationOptional<boolean>;
  declare calendarNofi: CreationOptional<boolean>;
  declare createdTime: CreationOptional<Date>;
  declare deleted: CreationOptional<boolean>;
  declare deletedTime: CreationOptional<Date | null>;
}

User.init(
  {
    userId: {
      field: "user_id",
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    cupId: {
      field: "cup_id",
      type: DataTypes.CHAR(8),
      allowNull: true,
      defaultValue: null,
      references: {
        model: Couple,
        key: "cupId"
      }
    },
    snsId: {
      field: "sns_id",
      type: DataTypes.STRING(20),
      unique: true,
      allowNull: false
    },
    snsKind: {
      field: "sns_kind",
      type: DataTypes.CHAR(4),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(30),
      unique: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    code: {
      type: DataTypes.CHAR(6),
      unique: true,
      allowNull: false
    },
    birthday: {
      type: DataTypes.DATE,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(11),
      unique: true,
      allowNull: false
    },
    profile: {
      type: DataTypes.STRING(200)
    },
    profileSize: {
      field: "profile_size",
      type: DataTypes.INTEGER.UNSIGNED
    },
    profileType: {
      field: "profile_type",
      type: DataTypes.STRING(20)
    },
    primaryNofi: {
      field: "primary_nofi",
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    dateNofi: {
      field: "date_nofi",
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    eventNofi: {
      field: "event_nofi",
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    coupleNofi: {
      field: "couple_nofi",
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    albumNofi: {
      field: "album_nofi",
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    calendarNofi: {
      field: "calendar_nofi",
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
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
    timestamps: false,
    tableName: "user"
  }
);

applyDateHook(User);
