import dayjs from "dayjs";
import { DataTypes, Model, literal } from "sequelize";
import { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize/types/model";

import sequelize from ".";

export class Culture extends Model<InferAttributes<Culture>, InferCreationAttributes<Culture>> {
    declare curtureId: CreationOptional<number>;
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
    declare useFee: string; // 50
    declare parking: string; // 40
    declare restDate: string; //20
    declare homepage: string; // 50
    declare createdTime: string; // 15
}

export interface PageOptions {
    numOfRows: number;
    page: number;
    sort: string | "na" | "nd" | "r" | "o";
}

export interface SearchOptions {
    contentTypeId?: string;
    title?: string;
    contentId?: string;
}

export interface ICultureResponseWithCount {
    cultures: Culture[];
    count: number;
}

Culture.init(
    {
        curtureId: {
            field: "culture_id",
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
        useFee: {
            field: "use_fee",
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
        },
        createdTime: {
            field: "created_time",
            type: DataTypes.STRING
        }
    },
    {
        sequelize: sequelize,
        tableName: "culture",
        timestamps: false
    }
);
