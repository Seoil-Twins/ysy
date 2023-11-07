import { DataTypes, Model, literal } from "sequelize";
import { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize/types/model";

import sequelize from "./index.js";

import { User } from "./user.model.js";
import { DatePlace } from "./datePlace.model.js";

export class DatePlaceView extends Model<InferAttributes<DatePlaceView>, InferCreationAttributes<DatePlaceView>> {
  declare datePlaceViewId: CreationOptional<number>;
  declare userId: number;
  declare contentId: string;
  declare createdTime: CreationOptional<Date>;
}

DatePlaceView.init(
  {
    datePlaceViewId: {
      field: "date_place_view_id",
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      field: "user_id",
      type: DataTypes.INTEGER.UNSIGNED,
      references: {
        model: User,
        key: "userId"
      }
    },
    contentId: {
      field: "content_id",
      type: DataTypes.STRING(10),
      allowNull: false,
      references: {
        model: DatePlace,
        key: "contentId"
      }
    },
    createdTime: {
      field: "created_time",
      type: "TIMESTAMP",
      defaultValue: literal("CURRENT_TIMESTAMP")
    }
  },
  {
    sequelize: sequelize,
    tableName: "date_place_view",
    timestamps: false
  }
);
