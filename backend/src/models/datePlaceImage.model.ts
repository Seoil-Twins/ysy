import { DataTypes, Model, literal } from "sequelize";
import { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize/types/model";

import sequelize, { applyDateHook } from "./index.js";
import { DatePlace } from "./datePlace.model.js";

export class DatePlaceImage extends Model<InferAttributes<DatePlaceImage>, InferCreationAttributes<DatePlaceImage>> {
  declare datePlaceImageId: CreationOptional<number>;
  declare contentId: string;
  declare path: string;
  declare createdTime: CreationOptional<Date>;
}

DatePlaceImage.init(
  {
    datePlaceImageId: {
      field: "date_place_image_id",
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    contentId: {
      field: "content_id",
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: DatePlace,
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
    tableName: "date_place_image",
    timestamps: false
  }
);

applyDateHook(DatePlaceImage);
