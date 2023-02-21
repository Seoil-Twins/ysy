import dayjs from "dayjs";
import { DataTypes, Model, literal } from "sequelize";

import sequelize from ".";
import { Inquire } from "./inquire.model";

// -------------------------------------------- Interface ------------------------------------------ //
export interface IInquireImage {
    imageId: number;
    inquireId: number;
    image: string;
    createdTime: Date;
}

export interface IRequestCreate {
    image: File | File[];
}

interface ICreate {
    inquireId: number;
    image: string;
}
// ------------------------------------------ Interface End ---------------------------------------- //

export class InquireImage extends Model<IInquireImage, ICreate> {
    declare imageId: number;
    declare inquireId: number;
    declare image: string;
    declare createdTime: Date;
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
            get(this: InquireImage): string {
                return dayjs(this.getDataValue("createdTime")).format("YYYY-MM-DD HH:mm:ss");
            }
        }
    },
    {
        sequelize: sequelize,
        tableName: "inquire_image",
        timestamps: false
    }
);
