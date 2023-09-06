import { DataTypes, Model, literal } from "sequelize";
import { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize/types/model";

import sequelize, { applyDateHook } from ".";

export class VenuesImage extends Model<InferAttributes<VenuesImage>, InferCreationAttributes<VenuesImage>> {
  declare venuesImageId: CreationOptional<number>;
  declare contentId: string;
  declare path: string;
  declare createdTime: CreationOptional<Date>;
}

VenuesImage.init(
  {
    venuesImageId: {
      field: "venues_image_id",
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    contentId: {
      field: "content_id",
      type: DataTypes.STRING,
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
    tableName: "solution_image",
    timestamps: false
  }
);

applyDateHook(VenuesImage);
