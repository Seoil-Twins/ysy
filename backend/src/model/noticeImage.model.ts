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

export class NoticeImage extends Model<InferAttributes<NoticeImage>, InferCreationAttributes<NoticeImage>> {
    declare imageId: CreationOptional<number>;
    declare noticeId: number;
    declare image: string;
    declare createdTime: CreationOptional<Date>;
}

NoticeImage.init(
    {
        imageId: {
            field: "image_id",
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        noticeId: {
            field: "notice_id",
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: Inquire,
                key: "notice_id"
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
            get(this: NoticeImage): string | null {
                const date = dayjs(this.getDataValue("createdTime"));
                const formatDate = date.format("YYYY-MM-DD HH:mm:ss");

                return date.isValid() ? formatDate : null;
            }
        }
    },
    {
        sequelize: sequelize,
        tableName: "notice_image",
        timestamps: false
    }
);
