import { File } from "formidable";
import { DataTypes, Model, literal } from "sequelize";

import sequelize from ".";
import { Solution } from "./solution.model";
import { User } from "./user.model";

// -------------------------------------------- Interface ------------------------------------------ //
export interface IInquire {
    inquireId: number;
    userId: number;
    title: string;
    contents: string;
    createdTime: Date;
}

export interface IResponse {
    inquireId: number;
    title: string;
    contents: string;
    createdTime: Date;
    solution: Solution | undefined;
}

export interface ICreate {
    userId: number;
    title: string;
    contents: string;
}

export interface IUpdate {
    inquireId: number;
    title: string;
    contents: string;
}
// ------------------------------------------ Interface End ---------------------------------------- //

export class Inquire extends Model<IInquire, ICreate> {
    declare inquireId: number;
    declare userId: number;
    declare title: string;
    declare contents: string;
    declare createdTime: Date;
}

Inquire.init(
    {
        inquireId: {
            field: "inquire_id",
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
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
        tableName: "inquire",
        timestamps: false
    }
);
