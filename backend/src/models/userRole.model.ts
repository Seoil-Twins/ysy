import { DataTypes, Model, NonAttribute } from "sequelize";
import { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize/types/model";

import sequelize from "./index.js";
import { Role } from "./role.model.js";
import { User } from "./user.model.js";

export class UserRole extends Model<InferAttributes<UserRole>, InferCreationAttributes<UserRole>> {
  declare role: NonAttribute<Role>;

  declare userRoleId: CreationOptional<number>;
  declare userId: number;
  declare roleId: number;
}

UserRole.init(
  {
    userRoleId: {
      field: "user_role_id",
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
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
    roleId: {
      field: "role_id",
      type: DataTypes.SMALLINT,
      allowNull: false,
      references: {
        model: Role,
        key: "roleId"
      }
    }
  },
  {
    sequelize: sequelize,
    tableName: "user_role",
    timestamps: false
  }
);
