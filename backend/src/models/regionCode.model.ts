import { DataTypes, Model } from "sequelize";
import { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize/types/model";

import sequelize from "./index.js";

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
      primaryKey: true
    },
    mainCode: {
      field: "main_code",
      type: DataTypes.CHAR(2),
      allowNull: false
    },
    subCode: {
      field: "sub_code",
      type: DataTypes.CHAR(2),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(30),
      allowNull: false
    }
  },
  {
    sequelize: sequelize,
    tableName: "region_code",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["mainCode", "subCode"]
      }
    ]
  }
);
