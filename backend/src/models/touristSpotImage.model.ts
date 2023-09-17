import { DataTypes, Model, literal } from "sequelize";
import { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize/types/model";

import sequelize, { applyDateHook } from "./index.js";
import { TouristSpot } from "./touristSpot.model.js";

export class TouristSpotImage extends Model<InferAttributes<TouristSpotImage>, InferCreationAttributes<TouristSpotImage>> {
  declare touristSpotImageId: CreationOptional<number>;
  declare contentId: string;
  declare path: string;
  declare createdTime: CreationOptional<Date>;
}

TouristSpotImage.init(
  {
    touristSpotImageId: {
      field: "tourist_spot_image_id",
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    contentId: {
      field: "content_id",
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: TouristSpot,
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
    tableName: "tourist_spot_image",
    timestamps: false
  }
);

applyDateHook(TouristSpotImage);
