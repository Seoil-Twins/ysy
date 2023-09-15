import { DataTypes, Model, literal } from "sequelize";
import sequelize from "./index.js";

import { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize/types/model";
import { User } from "./user.model.js";

export class Favorite extends Model<InferAttributes<Favorite>, InferCreationAttributes<Favorite>> {
  declare favoriteId: CreationOptional<number>;
  declare userId: number;
  declare contentId: string;
  declare createdTime: string;
}

Favorite.init(
  {
    favoriteId: {
      field: "want_id",
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      field: "user_id",
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: User,
        key: "userId"
      }
    },
    contentId: {
      field: "content_id",
      type: DataTypes.STRING,
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
    tableName: "wanted",
    timestamps: false
  }
);
