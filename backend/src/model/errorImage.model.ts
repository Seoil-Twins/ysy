import dayjs from "dayjs";
import { DataTypes, Model, literal } from "sequelize";

import sequelize from ".";

// -------------------------------------------- Interface ------------------------------------------ //
export interface IErrorImage {
    errorId: number;
    path: string;
    createdTime: Date;
}

interface ICreate {
    path: string;
}
// ------------------------------------------ Interface End ---------------------------------------- //

export class ErrorImage extends Model<IErrorImage, ICreate> {
    declare path: string;
}

ErrorImage.init(
    {
        errorId: {
            field: "error_id",
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        path: {
            type: DataTypes.STRING(60)
        },
        createdTime: {
            field: "created_time",
            type: "TIMESTAMP",
            defaultValue: literal("CURRENT_TIMESTAMP"),
            get(this: ErrorImage): string | null {
                const date = dayjs(this.getDataValue("createdTime"));
                const formatDate = date.format("YYYY-MM-DD HH:mm:ss");

                return date.isValid() ? formatDate : null;
            }
        }
    },
    {
        sequelize: sequelize,
        tableName: "error_image",
        timestamps: false
    }
);
