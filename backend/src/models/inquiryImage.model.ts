import { DataTypes, Model, literal } from "sequelize";
import { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize/types/model";

import sequelize, { applyDateHook } from ".";
import { Inquiry } from "./inquiry.model";

export class InquiryImage extends Model<InferAttributes<InquiryImage>, InferCreationAttributes<InquiryImage>> {
  declare inquiryImageId: CreationOptional<number>;
  declare inquiryId: number;
  declare size: number;
  declare type: string;
  declare path: string;
  declare createdTime: CreationOptional<Date>;
}

InquiryImage.init(
  {
    inquiryImageId: {
      field: "inquiry_image_id",
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    inquiryId: {
      field: "inquiry_id",
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: Inquiry,
        key: "inquiryId"
      }
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
    tableName: "inquiry_image",
    timestamps: false
  }
);

applyDateHook(InquiryImage);
