import { DataTypes, Model } from "sequelize";
import { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize/types/model";

import sequelize from ".";

export class RegionCode extends Model<InferAttributes<RegionCode>, InferCreationAttributes<RegionCode>> {
  declare regionId: CreationOptional<number>;
  declare mainCode: number;
  declare subCode: number;
  declare name: string;
}

RegionCode.init(
  {
    regionId: {
      field: "region_id",
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    mainCode: {
      field: "main_code",
      type: DataTypes.SMALLINT,
      allowNull: false
    },
    subCode: {
      field: "sub_code",
      type: DataTypes.SMALLINT,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(30),
      allowNull: false
    }
  },
  {
    sequelize: sequelize,
    tableName: "content_type",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["mainCode", "subCode"]
      }
    ]
  }
);
