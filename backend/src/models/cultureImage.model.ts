import { DataTypes, Model, literal } from "sequelize";
import { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize/types/model";

import sequelize, { applyDateHook } from "./index.js";
import { Culture } from "./culture.model.js";

export class CultureImage extends Model<InferAttributes<CultureImage>, InferCreationAttributes<CultureImage>> {
  declare cultureImageId: CreationOptional<number>;
  declare contentId: string;
  declare path: string;
  declare createdTime: CreationOptional<Date>;
}

CultureImage.init(
  {
    cultureImageId: {
      field: "culture_image_id",
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    contentId: {
      field: "content_id",
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Culture,
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
    tableName: "culture_image",
    timestamps: false
  }
);

applyDateHook(CultureImage);
