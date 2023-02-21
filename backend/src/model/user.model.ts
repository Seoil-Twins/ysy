import dayjs from "dayjs";
import { DataTypes, Model, literal, NonAttribute } from "sequelize";

import sequelize from ".";
import { Couple } from "./couple.model";
import { Inquire } from "./inquire.model";
import { Role } from "./role.model";
import { UserRole } from "./userRole.model";

// -------------------------------------------- Interface ------------------------------------------ //
export interface IUser {
    userId: number;
    cupId: string | null;
    snsId: string;
    code: string;
    name: string;
    password: string;
    email: string;
    birthday: Date;
    phone: string;
    profile: string | null;
    primaryNofi: boolean;
    dateNofi: boolean;
    eventNofi: boolean;
    createdTime: Date;
    deleted: boolean;
    deletedTime: Date | null;
}

export interface ICreate {
    snsId: string;
    code: string;
    name: string;
    password: string;
    email: string;
    phone: string;
    birthday: Date;
    eventNofi: boolean;
}

export interface IUpdate {
    userId: number;
    name?: string;
    profile?: string | null;
    primaryNofi?: boolean;
    dateNofi?: boolean;
    eventNofi?: boolean;
}

export interface IUserResponse {
    userId: number;
    cupId: string | null;
    snsId: string;
    code: string;
    name: string;
    email: string;
    birthday: Date;
    phone: string;
    profile: string | null;
    primaryNofi: boolean;
    dateNofi: boolean;
    eventNofi: boolean;
    createdTime: Date;
    deleted: boolean;
    deletedTime: Date | null;
    couple: User | null;
}

export interface IUserRoleResult {
    userId: number;
    cupId: string | null;
    snsId: string;
    code: string;
    name: string;
    email: string;
    birthday: Date;
    phone: string;
    profile: string | null;
    primaryNofi: boolean;
    dateNofi: boolean;
    eventNofi: boolean;
    createdTime: Date;
    deleted: boolean;
    deletedTime: Date | null;
    role: Role;
}

export interface IUserResponseWithCount {
    users: User[];
    count: number;
}
// ------------------------------------------ Interface End ---------------------------------------- //

export class User extends Model<IUser, ICreate> {
    /** If you use include couple, You can use couple field. */
    declare couple?: NonAttribute<Couple>;
    /** If you use include inquire, You can use inquire field. */
    declare inquires?: NonAttribute<Inquire>;
    /** If you use include inquire, You can use inquire field. */
    declare userRole?: NonAttribute<UserRole>;

    declare userId: number;
    declare cupId: string | null;
    declare snsId: string;
    declare code: string;
    declare name: string;
    declare password: string;
    declare email: string;
    declare birthday: Date;
    declare phone: string;
    declare profile: string | null;
    declare primaryNofi: boolean;
    declare dateNofi: boolean;
    declare eventNofi: boolean;
    declare createdTime: Date;
    declare deleted: boolean;
    declare deletedTime: Date | null;
}

User.init(
    {
        userId: {
            field: "user_id",
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        cupId: {
            field: "cup_id",
            type: DataTypes.STRING(8),
            allowNull: true,
            defaultValue: null,
            references: {
                model: Couple,
                key: "cupId"
            }
        },
        snsId: {
            field: "sns_id",
            type: DataTypes.STRING(4),
            allowNull: false
        },
        code: {
            type: DataTypes.STRING(6),
            unique: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(30),
            unique: true,
            allowNull: false
        },
        birthday: {
            type: DataTypes.DATE,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        phone: {
            type: DataTypes.STRING(11),
            unique: true,
            allowNull: false
        },
        profile: {
            type: DataTypes.STRING(60)
        },
        primaryNofi: {
            field: "primary_nofi",
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        dateNofi: {
            field: "date_nofi",
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        eventNofi: {
            field: "event_nofi",
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        createdTime: {
            field: "created_time",
            type: "TIMESTAMP",
            defaultValue: literal("CURRENT_TIMESTAMP"),
            get(this: User): string {
                return dayjs(this.getDataValue("createdTime")).format("YYYY-MM-DD HH:mm:ss");
            }
        },
        deleted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            get(this: User): string {
                return dayjs(this.getDataValue("deletedTime")).format("YYYY-MM-DD HH:mm:ss");
            }
        },
        deletedTime: {
            field: "deleted_time",
            type: "TIMESTAMP"
        }
    },
    {
        sequelize: sequelize,
        timestamps: false,
        tableName: "user"
    }
);
