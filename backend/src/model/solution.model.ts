import { DataTypes, Model, literal, NonAttribute, HasManyGetAssociationsMixin } from "sequelize";
import { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize/types/model";

import sequelize, { applyDateHook } from ".";
import { Inquire } from "./inquire.model";
import { SolutionImage } from "./solutionImage.model";

// -------------------------------------------- Interface ------------------------------------------ //
export interface ICreate {
    title: string;
    contents: string;
}

export interface IUpdate{
    inquireId?: number;
    title?: string;
    contents?: string;
}

export interface ISolutionResponseWithCount {
    solutions: Solution[];
    count: number;
}

export interface PageOptions {
    count: number;
    page: number;
    sort: string | "r" | "o";
}

export interface SearchOptions {
    userId?: number;
    username?: string;
    title?: string;
}

export interface FilterOptions {
    fromDate?: Date;
    toDate?: Date;
    hasImage?: boolean;
}
// ------------------------------------------ Interface End ---------------------------------------- //

export class Solution extends Model<InferAttributes<Solution>, InferCreationAttributes<Solution>> {
    /** If you use include inquire, You can use inquire field. */
    declare inquire?: NonAttribute<Inquire>;
    declare solutionImages?: NonAttribute<SolutionImage[]>;

    declare solutionId: CreationOptional<number>;
    declare inquireId: number;
    declare title: string;
    declare contents: string;
    declare createdTime: CreationOptional<Date>;

    declare getSolutionImages: HasManyGetAssociationsMixin<SolutionImage>;
}

Solution.init(
    {
        solutionId: {
            field: "solution_id",
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        inquireId: {
            field: "inquire_id",
            type: DataTypes.INTEGER.UNSIGNED,
            unique: true,
            allowNull: false,
            references: {
                model: Inquire,
                key: "inquire_id"
            }
        },
        title: {
            type: DataTypes.STRING(30),
            allowNull: false
        },
        contents: {
            type: DataTypes.STRING(300),
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
        tableName: "solution",
        timestamps: false
    }
);

applyDateHook(Solution);
