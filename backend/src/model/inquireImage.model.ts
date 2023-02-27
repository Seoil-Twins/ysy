import dayjs from "dayjs";
import { DataTypes, Model, literal } from "sequelize";
import { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize/types/model";

import sequelize from ".";
import { Inquire } from "./inquire.model";

// -------------------------------------------- Interface ------------------------------------------ //
export interface IRequestCreate {
    image: File | File[];
}
// ------------------------------------------ Interface End ---------------------------------------- //

export class InquireImage extends Model<InferAttributes<InquireImage>, InferCreationAttributes<InquireImage>> {
    declare imageId: CreationOptional<number>;
    declare inquireId: number;
    declare image: string;
    declare createdTime: CreationOptional<Date>;
}

InquireImage.init(
    {
        imageId: {
            field: "image_id",
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        inquireId: {
            field: "inquire_id",
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: Inquire,
                key: "inquire_id"
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
            get(this: InquireImage): string | null {
                const date = dayjs(this.getDataValue("createdTime"));
                const formatDate = date.format("YYYY-MM-DD HH:mm:ss");

                return date.isValid() ? formatDate : null;
            }
        }
    },
    {
        sequelize: sequelize,
        tableName: "inquire_image",
        timestamps: false
    }
);
