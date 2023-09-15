import { DataTypes, Model, literal } from "sequelize";
import sequelize from "./index.js";

import { CreationOptional, InferAttributes, InferCreationAttributes, NonAttribute } from "sequelize/types/model";
import { User } from "./user.model.js";
import { ContentType } from "./contentType.model.js";

export class Favorite extends Model<InferAttributes<Favorite>, InferCreationAttributes<Favorite>> {
  /** If you use include ContentType, You can use couple field. */
  declare contentType?: NonAttribute<ContentType>;

  declare favoriteId: CreationOptional<number>;
  declare userId: number;
  declare contentId: string;
  declare contentTypeId: string;
  declare createdTime: string;
}

Favorite.init(
  {
    favoriteId: {
      field: "want_id",
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
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
    contentId: {
      field: "content_id",
      type: DataTypes.STRING,
      allowNull: false
    },
    contentTypeId: {
      field: "content_type_id",
      type: DataTypes.CHAR(2),
      references: {
        model: ContentType,
        key: "contentTypeId"
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
    tableName: "favorite",
    timestamps: false
  }
);
