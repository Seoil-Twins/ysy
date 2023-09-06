import { DataTypes, Model, literal } from "sequelize";
import { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize/types/model";

import sequelize, { applyDateHook } from ".";

export class ErrorImage extends Model<InferAttributes<ErrorImage>, InferCreationAttributes<ErrorImage>> {
  declare errorId: CreationOptional<number>;
  declare errorLocation: string;
  declare size: number;
  declare type: string;
  declare path: string;
  declare createdTime: CreationOptional<Date>;
}

ErrorImage.init(
  {
    errorId: {
      field: "error_id",
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    errorLocation: {
      field: "error_location",
      type: DataTypes.STRING(60),
      allowNull: false
    },
    size: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING(20),
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
    tableName: "error_image",
    timestamps: false
  }
);

applyDateHook(ErrorImage);
