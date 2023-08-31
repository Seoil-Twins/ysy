import { DataTypes, Model, literal } from "sequelize";
import { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize/types/model";

import sequelize, { applyDateHook } from ".";
import { Solution } from "./solution.model";

export class SolutionImage extends Model<InferAttributes<SolutionImage>, InferCreationAttributes<SolutionImage>> {
  declare solutionImageId: CreationOptional<number>;
  declare solutionId: number;
  declare size: number;
  declare type: string;
  declare path: string;
  declare createdTime: CreationOptional<Date>;
}

SolutionImage.init(
  {
    solutionImageId: {
      field: "solution_image_id",
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    solutionId: {
      field: "solution_id",
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: Solution,
        key: "solutionId"
      }
    },
    size: {
      type: DataTypes.INTEGER,
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
    tableName: "solution_image",
    timestamps: false
  }
);

applyDateHook(SolutionImage);
