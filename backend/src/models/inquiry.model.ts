import { DataTypes, Model, literal, NonAttribute } from "sequelize";
import { HasManyGetAssociationsMixin } from "sequelize/types/associations";
import { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize/types/model";

import sequelize, { applyDateHook } from ".";
import { InquiryImage } from "./inquiryImage.model";
import { Solution } from "./solution.model";
import { User } from "./user.model";

export class Inquiry extends Model<InferAttributes<Inquiry>, InferCreationAttributes<Inquiry>> {
  /** If you use include inquireImage, You can use inquireImages field. */
  declare inquiryImages?: NonAttribute<InquiryImage[]>;
  /** If you use include solution, You can use solution field. */
  declare solution?: NonAttribute<Solution>;

  declare inquiryId: CreationOptional<number>;
  declare userId: number;
  declare title: string;
  declare contents: string;
  declare createdTime: CreationOptional<Date>;

  declare getInquiryImages: HasManyGetAssociationsMixin<InquiryImage>;
}

Inquiry.init(
  {
    inquiryId: {
      field: "inquiry_id",
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      field: "user_id",
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: User,
        key: "userId"
      }
    },
    title: {
      type: DataTypes.STRING(40),
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
    tableName: "inquiry",
    timestamps: false
  }
);

applyDateHook(Inquiry);
