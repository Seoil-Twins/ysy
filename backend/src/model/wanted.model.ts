
import { DataTypes, Model, literal } from "sequelize";
import sequelize from ".";

import { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize/types/model";
import { User } from "./user.model";


export class Wanted extends Model<InferAttributes<Wanted>, InferCreationAttributes<Wanted>> {
    declare wantId: CreationOptional<number>;
    declare userId: CreationOptional<number>;
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
    wantId?: number;
    userId?: number;
    content_id?: string;
}

Wanted.init(
    {
        wantId: {
            field: "want_id",
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true
        },
        userId: {
            field: "user_id",
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: User,
                key: "userId"
            }
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
