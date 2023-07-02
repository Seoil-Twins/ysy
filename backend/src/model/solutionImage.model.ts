import dayjs from "dayjs";
import { DataTypes, Model, literal } from "sequelize";
import { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize/types/model";

import sequelize, { applyDateHook } from ".";
import { Solution } from "./solution.model";

// -------------------------------------------- Interface ------------------------------------------ //
export interface IRequestCreate {
    image: File | File[];
}

export interface SolutionImageResponseWithCount {
    images: SolutionImage[];
    count: number;
}

export interface PageOptions {
    count: number;
    page: number;
    sort: string | "r" | "o";
}

export interface SearchOptions {
    solutionId?: number;
}

export interface FilterOptions {
    fromDate?: Date;
    toDate?: Date;
}
// ------------------------------------------ Interface End ---------------------------------------- //

export class SolutionImage extends Model<InferAttributes<SolutionImage>, InferCreationAttributes<SolutionImage>> {
    declare imageId: CreationOptional<number>;
    declare solutionId: number;
    declare image: string;
    declare createdTime: CreationOptional<Date>;
}

SolutionImage.init(
    {
        imageId: {
            field: "image_id",
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        solutionId: {
            field: "solution_id",
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: Solution,
                key: "solution_id"
            }
        },
        image: {
            type: DataTypes.STRING(200),
            allowNull: false
        },
        createdTime: {
            field: "created_time",
            type: "TIMESTAMP",
            defaultValue: literal("CURRENT_TIMESTAMP")
        }
    },
    {
        sequelize: sequelize,
        tableName: "solution_image",
        timestamps: false
    }
);

applyDateHook(SolutionImage);
