import { DataTypes, Model, literal, NonAttribute, HasManyGetAssociationsMixin } from "sequelize";
import { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize/types/model";

import sequelize, { applyDateHook } from ".";
import { Inquiry } from "./inquiry.model";
import { SolutionImage } from "./solutionImage.model";
import { User } from "./user.model";

export class Solution extends Model<InferAttributes<Solution>, InferCreationAttributes<Solution>> {
  /** If you use include inquire, You can use inquire field. */
  declare inquiry?: NonAttribute<Inquiry>;
  declare solutionImages?: NonAttribute<SolutionImage[]>;

  declare solutionId: CreationOptional<number>;
  declare inquiryId: number;
  declare uploaderId: number;
  declare title: string;
  declare contents: string;
  declare createdTime: CreationOptional<Date>;

  declare getSolutionImages: HasManyGetAssociationsMixin<SolutionImage>;
}

Solution.init(
  {
    solutionId: {
      field: "solution_id",
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    inquiryId: {
      field: "inquiry_id",
      type: DataTypes.INTEGER.UNSIGNED,
      unique: true,
      allowNull: false,
      references: {
        model: Inquiry,
        key: "inquiryId"
      }
    },
    uploaderId: {
      field: "uploader_id",
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: User,
        key: "userId"
      }
    },
    title: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    contents: {
      type: DataTypes.STRING(300),
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
    tableName: "solution",
    timestamps: false
  }
);

applyDateHook(Solution);
