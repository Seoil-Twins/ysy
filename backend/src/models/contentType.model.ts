import { DataTypes, Model } from "sequelize";
import { InferAttributes, InferCreationAttributes } from "sequelize/types/model";

import sequelize from ".";

export class ContentType extends Model<InferAttributes<ContentType>, InferCreationAttributes<ContentType>> {
  declare contentTypeId: string;
  declare name: string;
}

ContentType.init(
  {
    contentTypeId: {
      field: "content_type_id",
      type: DataTypes.CHAR(2),
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(15),
      unique: true,
      allowNull: false
    }
  },
  {
    sequelize: sequelize,
    tableName: "content_type",
    timestamps: false
  }
);
