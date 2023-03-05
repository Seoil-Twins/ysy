import dayjs from "dayjs";
import { DataTypes, Model, literal } from "sequelize";
import { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize/types/model";

import sequelize from ".";

export class ErrorImage extends Model<InferAttributes<ErrorImage>, InferCreationAttributes<ErrorImage>> {
    declare errorId: CreationOptional<number>;
    declare path: string;
    declare createdTime: CreationOptional<Date>;
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
            type: DataTypes.STRING(200)
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
