import dayjs from "dayjs";
import { DataTypes, Model, literal } from "sequelize";

import sequelize from ".";
import { Solution } from "./solution.model";

// -------------------------------------------- Interface ------------------------------------------ //
export interface ISolutionImage {
    imageId: number;
    solutionId: number;
    image: string;
    createdTime: Date;
}

export interface ICreate {
    solutionId: number;
    image: string;
    createdTime: Date;
}
// ------------------------------------------ Interface End ---------------------------------------- //

export class SolutionImage extends Model<ISolutionImage, ICreate> {
    declare imageId: number;
    declare solutionId: number;
    declare image: string;
    declare createdTime: Date;
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
            type: DataTypes.STRING(60),
            allowNull: false
        },
        createdTime: {
            field: "created_time",
            type: "TIMESTAMP",
            defaultValue: literal("CURRENT_TIMESTAMP"),
            get(this: SolutionImage): string | null {
                const date = dayjs(this.getDataValue("createdTime"));
                const formatDate = date.format("YYYY-MM-DD HH:mm:ss");

                return date.isValid() ? formatDate : null;
            }
        }
    },
    {
        sequelize: sequelize,
        tableName: "solution_image",
        timestamps: false
    }
);
