import { DataTypes, Model, literal, NonAttribute } from "sequelize";
import { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize/types/model";

import sequelize, { applyDateHook } from ".";
import { NoticeImage } from "./noticeImage.model";
import { User } from "./user.model";

export class Notice extends Model<InferAttributes<Notice>, InferCreationAttributes<Notice>> {
  /** If you use include inquireImage, You can use inquireImages field. */
  declare noticeImages?: NonAttribute<NoticeImage[]>;

  declare noticeId: CreationOptional<number>;
  declare uploaderId: number;
  declare title: string;
  declare contents: string;
  declare createdTime: CreationOptional<Date>;
}

Notice.init(
  {
    noticeId: {
      field: "notice_id",
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
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
      type: DataTypes.STRING(60),
      allowNull: false
    },
    contents: {
      type: DataTypes.TEXT,
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
    tableName: "notice",
    timestamps: false
  }
);

applyDateHook(Notice);
