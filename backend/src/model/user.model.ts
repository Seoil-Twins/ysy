import dayjs from "dayjs";
import { DataTypes, Model, literal, NonAttribute, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";

import sequelize from ".";
import { Couple } from "./couple.model";
import { Inquire } from "./inquire.model";
import { Role } from "./role.model";
import { UserRole } from "./userRole.model";

// -------------------------------------------- Interface ------------------------------------------ //
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
// -------------------------------------------- Admin ------------------------------------------ //

export interface IUserResponseWithCount {
    users: User[];
    count: number;
}

export interface PageOption {
    count: number;
    page: number;
    sort: string | "na" | "nd" | "r" | "o" | "dr" | "do";
}

export interface SearchOption {
    name?: string;
    snsId?: string;
}

export interface FilterOption {
    isCouple: boolean;
    isDeleted: boolean;
}

export interface ICreateWithAdmin {
    snsId: string;
    code?: string;
    name: string;
    email: string;
    password: string;
    birthday: Date;
    phone: string;
    profile?: string | null;
    primaryNofi: boolean;
    dateNofi: boolean;
    eventNofi: boolean;
    role: number;
}

export interface IUpdateWithAdmin {
    code?: string;
    name?: string;
    email?: string;
    password?: string;
    birthday?: Date;
    phone?: string;
    profile?: string | null;
    primaryNofi?: boolean;
    dateNofi?: boolean;
    eventNofi?: boolean;
    deleted?: boolean;
    deletedTime?: Date | null;
    role?: number;
}
// ------------------------------------------ Interface End ---------------------------------------- //

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    /** If you use include couple, You can use couple field. */
    declare couple?: NonAttribute<Couple>;
    /** If you use include inquire, You can use inquire field. */
    declare inquires?: NonAttribute<Inquire>;
    /** If you use include inquire, You can use inquire field. */
    declare userRole?: NonAttribute<UserRole>;

    declare userId: CreationOptional<number>;
    declare cupId: CreationOptional<string | null>;
    declare snsId: string;
    declare code: string;
    declare name: string;
    declare password: string;
    declare email: string;
    declare birthday: Date;
    declare phone: string;
    declare profile: CreationOptional<string | null>;
    declare primaryNofi: CreationOptional<boolean>;
    declare dateNofi: CreationOptional<boolean>;
    declare eventNofi: CreationOptional<boolean>;
    declare createdTime: CreationOptional<Date>;
    declare deleted: CreationOptional<boolean>;
    declare deletedTime: CreationOptional<Date | null>;
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
            get(this: User): string | null {
                const date = dayjs(this.getDataValue("createdTime"));
                const formatDate = date.format("YYYY-MM-DD HH:mm:ss");

                return date.isValid() ? formatDate : null;
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
            get(this: User): string | null {
                const date = dayjs(this.getDataValue("deletedTime"));
                const formatDate = date.format("YYYY-MM-DD HH:mm:ss");

                return date.isValid() ? formatDate : null;
            }
        }
    },
    {
        sequelize: sequelize,
        timestamps: false,
        tableName: "user"
    }
);
