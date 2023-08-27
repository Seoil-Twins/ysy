import dayjs from "dayjs";
import { DataTypes, Model, literal } from "sequelize";
import { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize/types/model";

import sequelize from ".";

export class Sports extends Model<InferAttributes<Sports>, InferCreationAttributes<Sports>> {
    declare sportsId: CreationOptional<number>;
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
    declare parking: string;
    declare restDate: string;
    declare homepage: string;
    declare modifiedTime: string; // 15
    declare openPeriod: string; // 30
    declare createdTime: string; // 15
}

export interface IUpdateWithAdmin{
    areaCode?: string;
    sigunguCode?: string;
    view?: number;
    title?: string;
    address?: string;
    mapX?: string;
    mapY?: string;

    description?: string; // 300
    thumbnail?: string; // 50
    phoneNumber?: string; // 13
    babyCarriage?: string; // 10
    pet?: string; // 50
    useTime?: string; // 50
    useFee?: string; // 50
    parking?: string;
    restDate?: string;
    homepage?: string;
    modifiedTime?: string; // 15
    openPeriod?: string; // 30
    createdTime?: string; // 15
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

export interface ISportsResponseWithCount {
    sports: Sports[];
    count: number;
}

Sports.init(
    {
        sportsId: {
            field: "sports_id",
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
        modifiedTime:  {
            field: "modified_time",
            type: DataTypes.STRING
        },
        openPeriod:  {
            field: "open_period",
            type: DataTypes.STRING
        },
        createdTime: {
            field: "created_time",
            type: DataTypes.STRING
        },
    },
    {
        sequelize: sequelize,
        tableName: "sports",
        timestamps: false
    }
);
