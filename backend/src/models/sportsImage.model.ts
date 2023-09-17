import { DataTypes, Model, literal } from "sequelize";
import { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize/types/model";

import sequelize, { applyDateHook } from "./index.js";
import { Sports } from "./sports.model.js";

export class SportsImage extends Model<InferAttributes<SportsImage>, InferCreationAttributes<SportsImage>> {
  declare sportsImageId: CreationOptional<number>;
  declare contentId: string;
  declare path: string;
  declare createdTime: CreationOptional<Date>;
}

SportsImage.init(
  {
    sportsImageId: {
      field: "sports_image_id",
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    contentId: {
      field: "content_id",
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Sports,
        key: "contentId"
      }
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
    tableName: "sports_image",
    timestamps: false
  }
);

applyDateHook(SportsImage);
