import { DataTypes, Model, literal, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";

import sequelize, { applyDateHook } from "./index.js";
import { User } from "./user.model.js";

export class Admin extends Model<InferAttributes<Admin>, InferCreationAttributes<Admin>> {
  declare adminId: CreationOptional<number>;
  declare userId: number;
  declare password: string;
  declare createdTime: CreationOptional<Date>;
}

Admin.init(
  {
    adminId: {
      field: "admin_id",
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      field: "user_id",
      type: DataTypes.INTEGER.UNSIGNED,
      unique: true,
      allowNull: false,
      references: {
        model: User,
        key: "userId"
      }
    },
    password: {
      type: DataTypes.STRING(150),
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
    timestamps: false,
    tableName: "admin"
  }
);

applyDateHook(Admin);
