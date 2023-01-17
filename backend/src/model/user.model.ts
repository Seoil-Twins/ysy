import dayjs from "dayjs";
import AbstractSQL from "./abstractSQL.model";
import { select, edit } from "../util/sql";
import { PoolConnection } from "mysql2/promise";

export const UserColumn = {
    userId: "user_id",
    cupId: "cup_id",
    snsId: "sns_id",
    code: "code",
    name: "name",
    password: "password",
    email: "email",
    birthday: "birthday",
    phone: "phone",
    profile: "profile",
    primaryNofi: "primary_nofi",
    dateNofi: "date_nofi",
    eventNofi: "event_nofi",
    createdTime: "created_time",
    deleted: "deleted",
    deletedTime: "deleted_time"
} as const;

// -------------------------------------------- Interface ------------------------------------------ //
export interface IUser {
    userId: number;
    cupId: string | null;
    snsId: string;
    code: string;
    name: string;
    password: string | undefined;
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

export interface ICreateData {
    snsId: string;
    code: string;
    name: string;
    password: string;
    email: string;
    phone: string;
    birthday: Date;
    eventNofi: boolean;
}

export interface IUpdateData {
    userId: number;
    name: string | undefined;
    profile: string | undefined;
    primaryNofi: boolean | undefined;
    dateNofi: boolean | undefined;
    eventNofi: boolean | undefined;
}

export interface IUpdateWithCupIdData {
    cupId: string;
}

export interface IDeleteData {
    userId: number;
}
// ------------------------------------------ Interface End ---------------------------------------- //

// -------------------------------------------- Options -------------------------------------------- //
export interface SelectOption {
    columns?: string[] | undefined;
    where?: string | undefined;
    orderBy?: string | undefined;
    limit?: number | undefined;
}

export interface UpdateOption {
    where: string;
}
// ------------------------------------------ Options End ------------------------------------------ //

export class User implements IUser {
    userId: number;
    cupId: string | null = null;
    snsId!: string;
    code!: string;
    name!: string;
    password: string | undefined;
    email!: string;
    birthday!: Date;
    phone!: string;
    profile: string | null = null;
    primaryNofi: boolean = true;
    dateNofi: boolean = true;
    eventNofi: boolean = false;
    createdTime: Date;
    deleted: boolean = false;
    deletedTime: Date | null = null;

    constructor(data: IUser) {
        this.userId = data.userId;
        this.cupId = data.cupId;
        this.snsId = data.snsId;
        this.code = data.code;
        this.name = data.name;
        this.password = data.password;
        this.email = data.email;
        this.birthday = data.birthday;
        this.phone = data.phone;
        this.profile = data.profile;
        this.primaryNofi = Boolean(data.primaryNofi);
        this.dateNofi = Boolean(data.dateNofi);
        this.eventNofi = Boolean(data.eventNofi);
        this.createdTime = data.createdTime;
        this.deleted = Boolean(data.deleted);
        this.deletedTime = data.deletedTime;
    }
}

export class UserSQL extends AbstractSQL {
    constructor() {
        super("user");
    }

    create(data: IUser): User {
        return new User(data);
    }

    async find(conn: PoolConnection, options: SelectOption): Promise<User[]> {
        const response: any[] = await select(conn, this.tableName, options);
        let result: User[] = [];

        if (response.length > 0) {
            for (let i = 0; i < response.length; i++) {
                result.push(this.create(response[i]));
            }
        }

        return result;
    }

    async add(conn: PoolConnection, data: ICreateData): Promise<void> {
        const birthday = dayjs(data.birthday.valueOf()).format("YYYY-MM-DD");
        const sql = `
            INSERT INTO ${this.tableName}
                (
                    ${UserColumn.snsId}, ${UserColumn.code}, ${UserColumn.name}, ${UserColumn.password}, ${UserColumn.email}, ${UserColumn.phone},
                    ${UserColumn.birthday}, ${UserColumn.eventNofi}
                )
                VALUES
                (
                    "${data.snsId}", "${data.code}", "${data.name}", "${data.password}",  "${data.email}", "${data.phone}",
                    "${birthday}", ${data.eventNofi}
                );
        `;

        await edit(conn, sql);
    }

    async update(conn: PoolConnection, data: IUpdateData, options: UpdateOption): Promise<void> {
        let sql = `UPDATE ${this.tableName} SET `;

        if (data.name) sql += `${UserColumn.name} = "${data.name}", `;
        if (data.profile) sql += `${UserColumn.profile} = "${data.profile}", `;
        if (data.primaryNofi !== undefined) sql += `${UserColumn.primaryNofi} = ${data.primaryNofi}, `;
        if (data.dateNofi !== undefined) sql += `${UserColumn.dateNofi} = ${data.dateNofi}, `;
        if (data.eventNofi !== undefined) sql += `${UserColumn.eventNofi} = ${data.eventNofi}, `;

        sql = sql.substring(0, sql.lastIndexOf(",")) + " ";
        sql += `WHERE ${options.where};`;

        await edit(conn, sql);
    }

    async delete(conn: PoolConnection, data: IDeleteData): Promise<void> {
        const now = dayjs();

        const sql = `
            UPDATE ${this.tableName} 
                SET ${UserColumn.deleted} = ${true}, ${UserColumn.deletedTime} = "${now.format("YYYY-MM-DD")}"
                WHERE ${UserColumn.userId} =  ${data.userId}`;

        await edit(conn, sql);
    }

    async updateWithCupId(conn: PoolConnection, data: IUpdateWithCupIdData, options: UpdateOption): Promise<void> {
        let sql = `
            UPDATE ${this.tableName} SET
                ${UserColumn.cupId} = "${data.cupId}" 
        `;

        sql += `WHERE ${options.where};`;

        await edit(conn, sql);
    }
}
