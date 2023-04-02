import dayjs from "dayjs";
import { DataTypes, Model, literal } from "sequelize";
import { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize/types/model";

import sequelize from ".";

// export interface ICreate {
//     restaurantId: string;
//     contentTypeId: string;
//     areaCode: string;
//     sigunguCode: string;
//     view: number;
//     title: string;
//     address: string;
//     mapX: string;
//     mapY: string;
// }

export class Restaurant extends Model<InferAttributes<Restaurant>, InferCreationAttributes<Restaurant>> {
    declare restaurantId: CreationOptional<number>;
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
    declare signatureDish: string; // 20
    declare phoneNumber: string; // 13
    declare kidsFacility: string; // 10
    declare useTime: string; // 50
    declare parking: string; // 40
    declare restDate: string; //20
    declare smoking: string; //20
    declare reservation: string; // 50
    declare homepage: string; // 50
    declare createdTime: string;
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

export interface FilterOptions {}

export interface IRestaurantResponseWithCount {
    restaurants: Restaurant[];
    count: number;
}

export interface IUpdateWithAdmin {
    areaCode?: string;
    sigunguCode?: string;
    view?: number;
    title?: string;
    address?: string;
    mapX?: string;
    mapY?: string;

    description?: string;
    thumbnail?: string;
    signatureDish?: string;
    phoneNumber?: string;
    kidsFacility?: string;
    useTime?: string;
    parking?: string;
    restDate?: string;
    smoking?: string;
    reservation?: string;
    homepage?: string;
    createdTime?: string;
}

Restaurant.init(
    {
        restaurantId: {
            field: "restaurant_id",
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
        signatureDish: {
            field: "signature_dish",
            type: DataTypes.STRING
        },
        phoneNumber: {
            field: "phone_number",
            type: DataTypes.STRING
        },
        kidsFacility: {
            field: "kids_facility",
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
        smoking: {
            field: "smoking",
            type: DataTypes.STRING
        },
        reservation: {
            field: "reservation",
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
        tableName: "restaurant",
        timestamps: false
    }
);
