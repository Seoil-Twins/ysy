import { DataTypes, Model, literal } from "sequelize";
import { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize/types/model";

import sequelize, { applyDateHook } from "./index.js";
import { Shopping } from "./shopping.model.js";

export class ShoppingImage extends Model<InferAttributes<ShoppingImage>, InferCreationAttributes<ShoppingImage>> {
  declare shoppingImageId: CreationOptional<number>;
  declare contentId: string;
  declare path: string;
  declare createdTime: CreationOptional<Date>;
}

ShoppingImage.init(
  {
    shoppingImageId: {
      field: "shopping_image_id",
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    contentId: {
      field: "content_id",
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Shopping,
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
    tableName: "shopping_image",
    timestamps: false
  }
);

applyDateHook(ShoppingImage);
