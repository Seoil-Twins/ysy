import { DataTypes, Model, literal } from "sequelize";
import { CreationOptional, InferAttributes, InferCreationAttributes, NonAttribute } from "sequelize/types/model";

import sequelize, { applyDateHook } from "./index.js";
import { ContentType } from "./contentType.model.js";
import { User } from "./user.model.js";

export class DatePlace extends Model<InferAttributes<DatePlace>, InferCreationAttributes<DatePlace>> {
  /** If you use include couple, You can use couple field. */
  declare users?: NonAttribute<User>;

  declare contentId: string;
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
  declare thumbnail: CreationOptional<string | null>;
  declare telephone: CreationOptional<string>;
  declare useTime: CreationOptional<string>;
  declare restDate: CreationOptional<string>;
  declare homepage: CreationOptional<string>;
  declare parking: CreationOptional<string>;
  declare kidsFacility: CreationOptional<string>;
  declare smoking: CreationOptional<string>;
  declare signatureDish: CreationOptional<string>;
  declare babyCarriage: CreationOptional<string>;
  declare pet: CreationOptional<string>;
  declare useSeason: CreationOptional<string>;
  declare useFee: CreationOptional<string>;
  declare availableAge: CreationOptional<string>;
  declare saleItem: CreationOptional<string>;
  declare registrationTime: Date;
  declare createdTime: CreationOptional<Date>;
}

DatePlace.init(
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
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    address: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    mapX: {
      field: "map_x",
      type: DataTypes.STRING(20),
      allowNull: false
    },
    mapY: {
      field: "map_y",
      type: DataTypes.STRING(20),
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
      type: DataTypes.STRING(200)
    },
    telephone: {
      type: DataTypes.STRING(100)
    },
    useTime: {
      field: "use_time",
      type: DataTypes.STRING(200)
    },
    restDate: {
      field: "rest_date",
      type: DataTypes.STRING(200)
    },
    homepage: {
      type: DataTypes.STRING(200)
    },
    parking: {
      type: DataTypes.STRING(50)
    },
    kidsFacility: {
      field: "kids_facility",
      type: DataTypes.STRING(50)
    },
    smoking: {
      type: DataTypes.STRING(50)
    },
    signatureDish: {
      field: "signature_dish",
      type: DataTypes.STRING(100)
    },
    babyCarriage: {
      field: "baby_carriage",
      type: DataTypes.STRING(50)
    },
    pet: {
      type: DataTypes.STRING(50)
    },
    useSeason: {
      field: "use_season",
      type: DataTypes.STRING(200)
    },
    useFee: {
      field: "use_fee",
      type: DataTypes.STRING(300)
    },
    availableAge: {
      field: "available_age",
      type: DataTypes.STRING(200)
    },
    saleItem: {
      field: "sale_item",
      type: DataTypes.STRING(200)
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
    tableName: "date_place",
    timestamps: false
  }
);

applyDateHook(DatePlace);
