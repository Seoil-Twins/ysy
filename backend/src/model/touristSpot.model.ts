import dayjs from "dayjs";
import { DataTypes, Model, literal } from "sequelize";
import { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize/types/model";

import sequelize from ".";

export class TouristSpot extends Model<InferAttributes<TouristSpot>, InferCreationAttributes<TouristSpot>> {
    declare spotId: CreationOptional<number>;
    declare contentTypeId: CreationOptional<string>;
    declare areaCode: CreationOptional<string>;
    declare sigunguCode: CreationOptional<string>;
    declare view: CreationOptional<number>;
    declare title: CreationOptional<string>;
    declare address: CreationOptional<string>;
    declare mapX: CreationOptional<string>;
    declare mapY: CreationOptional<string>;

    declare contentId: string; // 10 , default null
    declare description: string; // 300
    declare thumbnail: string; // 50
    declare phoneNumber: string; // 13
    declare babyCarriage: string; // 10
    declare pet: string; // 50
    declare useTime: string; // 50
    declare parking: string; // 40
    declare restDate: string; //20
    declare homepage: string; // 50
}

export interface PageOptions {
    numOfRows: number;
    page: number;
}

export interface SearchOptions {
    contentTypeId?: string;
}

export interface ITouristSpotResponseWithCount {
    touristspots: TouristSpot[];
    count: number;
}

TouristSpot.init(
    {
        spotId: {
            field: "spot_id",
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true
        },
        contentTypeId: {
            field: "content_type_id",
            type: DataTypes.STRING,
            allowNull: false
        },
        areaCode: {
            field: "area_code",
            type: DataTypes.STRING,
            allowNull: false
        },
        sigunguCode: {
            field: "sigungu_code",
            type: DataTypes.STRING,
            allowNull: false
        },
        view: {
            field: "view",
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        title: {
            field: "title",
            type: DataTypes.STRING,
            allowNull: false
        },
        address: {
            field: "address",
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
        contentId: {
            field: "content_id",
            type: DataTypes.STRING,
            defaultValue: null
        },
        description: {
            field: "description",
            type: DataTypes.STRING
        },
        thumbnail: {
            field: "thumbnail",
            type: DataTypes.STRING
        },
        babyCarriage: {
            field: "baby_carriage",
            type: DataTypes.STRING
        },
        phoneNumber: {
            field: "phone_number",
            type: DataTypes.STRING
        },
        pet: {
            field: "pet",
            type: DataTypes.STRING
        },
        useTime: {
            field: "use_time",
            type: DataTypes.STRING
        },
        parking: {
            field: "parking",
            type: DataTypes.STRING
        },
        restDate: {
            field: "rest_date",
            type: DataTypes.STRING
        },
        homepage: {
            field: "homepage",
            type: DataTypes.STRING
        }
    },
    {
        sequelize: sequelize,
        tableName: "tourist_spot",
        timestamps: false
    }
);
