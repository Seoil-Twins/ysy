import dayjs from "dayjs";
import { DataTypes, Model, literal, NonAttribute } from "sequelize";
import { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize/types/model";

import sequelize, { applyDateHook } from ".";
import { InquireImage } from "./inquireImage.model";

// -------------------------------------------- Interface ------------------------------------------ //
export interface ICreate {
    title: string;
    contents: string;
}

export interface IUpdate {
    noticeId: number;
    title?: string;
    contents?: string;
}
// ------------------------------------------ Interface End ---------------------------------------- //

export class Notice extends Model<InferAttributes<Notice>, InferCreationAttributes<Notice>> {
    /** If you use include inquireImage, You can use inquireImages field. */
    declare noticeImages?: NonAttribute<InquireImage[]>;

    declare noticeId: CreationOptional<number>;
    declare title: string;
    declare contents: string;
    declare createdTime: CreationOptional<Date>;
}

Notice.init(
    {
        noticeId: {
            field: "notice_id",
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
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
        tableName: "notice",
        timestamps: false
    }
);

applyDateHook(Notice);
