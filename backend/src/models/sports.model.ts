import { DataTypes, Model, literal } from "sequelize";
import { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize/types/model";

import sequelize, { applyDateHook } from "./index.js";
import { ContentType } from "./contentType.model.js";

export class Sports extends Model<InferAttributes<Sports>, InferCreationAttributes<Sports>> {
  declare contentId: number;
  declare contentTypeId: string;
  declare areaCode: string;
  declare sigunguCode: string;
  declare title: string;
  declare description: string;
  declare address: string;
  declare mapX: string;
  declare mapY: string;
  declare mapLevel: string;
  declare views: number;
  declare thumbnail: CreationOptional<string>;
  declare telephone: CreationOptional<string>;
  declare useTime: CreationOptional<string>;
  declare restDate: CreationOptional<string>;
  declare homepage: CreationOptional<string>;
  declare parking: CreationOptional<string>;
  declare babyCarriage: CreationOptional<string>;
  declare pet: CreationOptional<string>;
  declare useFee: CreationOptional<string>;
  declare availableAge: CreationOptional<string>;
  declare registrationTime: Date;
  declare createdTime: CreationOptional<Date>;
}

Sports.init(
  {
    contentId: {
      field: "content_id",
      type: DataTypes.STRING(10),
      primaryKey: true
    },
    contentTypeId: {
      field: "content_type_id",
      type: DataTypes.CHAR(2),
      allowNull: false,
      references: {
        model: ContentType,
        key: "content_type_id"
      },
      defaultValue: "39"
    },
    areaCode: {
      field: "area_code",
      type: DataTypes.CHAR(2),
      allowNull: false
    },
    sigunguCode: {
      field: "sigungu_code",
      type: DataTypes.CHAR(2),
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false
    },
    mapX: {
      field: "map_x",
      type: DataTypes.STRING,
      allowNull: false
    },
    mapY: {
      field: "map_y",
      type: DataTypes.STRING,
      allowNull: false
    },
    mapLevel: {
      field: "map_level",
      type: DataTypes.CHAR(1),
      allowNull: false
    },
    views: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    thumbnail: {
      type: DataTypes.STRING
    },
    telephone: {
      type: DataTypes.STRING
    },
    useTime: {
      field: "use_time",
      type: DataTypes.STRING
    },
    restDate: {
      field: "rest_date",
      type: DataTypes.STRING
    },
    homepage: {
      type: DataTypes.STRING
    },
    parking: {
      type: DataTypes.STRING
    },
    babyCarriage: {
      field: "baby_carriage",
      type: DataTypes.STRING
    },
    pet: {
      type: DataTypes.STRING
    },
    useFee: {
      field: "use_fee",
      type: DataTypes.STRING
    },
    availableAge: {
      field: "available_age",
      type: DataTypes.STRING
    },
    registrationTime: {
      field: "registration_time",
      type: "TIMESTAMP",
      allowNull: false
    },
    createdTime: {
      field: "created_time",
      type: "TIMESTAMP",
      defaultValue: literal("CURRENT_TIMESTAMP"),
      allowNull: false
    }
  },
  {
    sequelize: sequelize,
    tableName: "sports",
    timestamps: false
  }
);

applyDateHook(Sports);
