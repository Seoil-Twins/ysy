import dayjs from "dayjs";
import { DataTypes, Model, literal } from "sequelize";

import sequelize from ".";
import { Inquire } from "./inquire.model";

// -------------------------------------------- Interface ------------------------------------------ //
export interface INoticeImage {
    imageId: number;
    noticeId: number;
    image: string;
    createdTime: Date;
}

export interface IRequestCreate {
    image: File | File[];
}

interface ICreate {
    noticeId: number;
    image: string;
}
// ------------------------------------------ Interface End ---------------------------------------- //

export class NoticeImage extends Model<INoticeImage, ICreate> {
    declare imageId: number;
    declare noticeId: number;
    declare image: string;
    declare createdTime: Date;
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
