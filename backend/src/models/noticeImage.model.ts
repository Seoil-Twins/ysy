import { DataTypes, Model, literal } from "sequelize";
import { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize/types/model";

import sequelize, { applyDateHook } from ".";
import { Notice } from "./notice.model";

export class NoticeImage extends Model<InferAttributes<NoticeImage>, InferCreationAttributes<NoticeImage>> {
  declare notionImageId: CreationOptional<number>;
  declare noticeId: number;
  declare size: number;
  declare type: string;
  declare path: string;
  declare createdTime: CreationOptional<Date>;
}

NoticeImage.init(
  {
    notionImageId: {
      field: "notion_image_id",
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    noticeId: {
      field: "notice_id",
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: Notice,
        key: "noticeId"
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
    tableName: "notice_image",
    timestamps: false
  }
);

applyDateHook(NoticeImage);
