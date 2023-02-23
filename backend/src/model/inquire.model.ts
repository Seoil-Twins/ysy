import dayjs from "dayjs";
import { DataTypes, Model, literal, NonAttribute } from "sequelize";
import { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize/types/model";

import sequelize from ".";
import { InquireImage } from "./inquireImage.model";
import { Solution } from "./solution.model";
import { User } from "./user.model";

// -------------------------------------------- Interface ------------------------------------------ //
export interface ICreate {
    userId: number;
    title: string;
    contents: string;
}

export interface IUpdate {
    inquireId: number;
    title?: string;
    contents?: string;
}
// ------------------------------------------ Interface End ---------------------------------------- //

export class Inquire extends Model<InferAttributes<Inquire>, InferCreationAttributes<Inquire>> {
    /** If you use include inquireImage, You can use inquireImages field. */
    declare inquireImages?: NonAttribute<InquireImage>;
    /** If you use include solution, You can use solution field. */
    declare solution?: NonAttribute<Solution>;

    declare inquireId: CreationOptional<number>;
    declare userId: number;
    declare title: string;
    declare contents: string;
    declare createdTime: CreationOptional<Date>;
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
            defaultValue: literal("CURRENT_TIMESTAMP"),
            get(this: Inquire): string | null {
                const date = dayjs(this.getDataValue("createdTime"));
                const formatDate = date.format("YYYY-MM-DD HH:mm:ss");

                return date.isValid() ? formatDate : null;
            }
        }
    },
    {
        sequelize: sequelize,
        tableName: "inquire",
        timestamps: false
    }
);
