import dayjs from "dayjs";
import { DataTypes, Model, literal, HasManyGetAssociationsMixin, NonAttribute } from "sequelize";
import { File } from "formidable";

import sequelize from ".";
import { Album } from "./album.model";
import { User } from "./user.model";
import { Calendar } from "./calendar.model";

// -------------------------------------------- Interface ------------------------------------------ //
export interface ICouple {
    cupId: string;
    cupDay: Date;
    title: string;
    thumbnail: string | null;
    createdTime: Date;
    deleted: boolean;
    deletedTime: Date | null;
}

export interface IRequestCreate {
    // Auth Middleware User Id
    userId: number;
    userId2: number;
    cupDay: Date;
    title: string;
    thumbnail?: File;
}

export interface IUpdate {
    userId: number;
    cupId: string;
    title?: string;
    thumbnail?: string | null;
    cupDay?: Date;
}

interface ICreate {
    cupId: string;
    cupDay: Date;
    title: string;
    thumbnail: string | null;
}
// ------------------------------------------ Interface End ---------------------------------------- //

export class Couple extends Model<ICouple, ICreate> {
    /** If you use include user, You can use users field. */
    declare users?: NonAttribute<User>;
    /** If you use include album, You can use albums field. */
    declare albums?: NonAttribute<Album>;
    /** If you use include calendar, You can use calendars field. */
    declare calendars?: NonAttribute<Calendar>;

    declare cupId: string;
    declare cupDay: Date;
    declare title: string;
    declare thumbnail: string | null;
    declare deleted: boolean;
    declare deletedTime: Date | null;

    declare getUsers: HasManyGetAssociationsMixin<User>;
    declare getAlbums: HasManyGetAssociationsMixin<Album>;
    declare getCalendars: HasManyGetAssociationsMixin<Calendar>;
}

Couple.init(
    {
        cupId: {
            field: "cup_id",
            type: DataTypes.STRING(8),
            primaryKey: true
        },
        cupDay: {
            field: "cup_day",
            type: DataTypes.DATE,
            allowNull: false
        },
        title: {
            type: DataTypes.STRING(15),
            allowNull: false
        },
        thumbnail: {
            type: DataTypes.STRING(60)
        },
        createdTime: {
            field: "created_time",
            type: "TIMESTAMP",
            defaultValue: literal("CURRENT_TIMESTAMP"),
            get(this: Couple): string {
                return dayjs(this.getDataValue("createdTime")).format("YYYY-MM-DD HH:mm:ss");
            }
        },
        deleted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        deletedTime: {
            field: "deleted_time",
            type: "TIMESTAMP",
            get(this: Couple): string {
                return dayjs(this.getDataValue("deletedTime")).format("YYYY-MM-DD HH:mm:ss");
            }
        }
    },
    {
        sequelize: sequelize,
        tableName: "couple",
        timestamps: false
    }
);
