
import { DataTypes, Model, literal } from "sequelize";
import { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize/types/model";

import sequelize from ".";

export class Wanted extends Model<InferAttributes<Wanted>, InferCreationAttributes<Wanted>> {
    declare want_id: CreationOptional<number>;
    declare user_id: CreationOptional<number>;
    declare content_id: CreationOptional<string>;
    declare content_type_id: CreationOptional<string>;
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


export interface IUpdateWithAdmin {
    want_id?: number;
    user_id?: number;
    content_id?: string;
}

Wanted.init(
    {
        want_id: {
            field: "want_id",
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true
        },
        user_id: {
            field: "user_id",
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        content_id: {
            field: "content_id",
            type: DataTypes.STRING,
            allowNull: false
        },
        content_type_id: {
            field: "content_type_id",
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    {
        sequelize: sequelize,
        tableName: "wanted",
        timestamps: false
    }
);
