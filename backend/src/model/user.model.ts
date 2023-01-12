import dayjs from "dayjs";
import { ResultSetHeader } from "mysql2";
import InternalServerError from "../error/internalServer";
import { select, editWithSQL } from "../util/sql";

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

export interface ICreateUser {
    snsId: string;
    code: string;
    name: string;
    password: string;
    email: string;
    phone: string;
    birthday: Date;
    eventNofi: boolean;
}

export interface IUpdateUser {
    userId: number;
    name: string | undefined;
    profile: string | undefined;
    primaryNofi: boolean | undefined;
    dateNofi: boolean | undefined;
    eventNofi: boolean | undefined;
}
// ------------------------------------------ Interface End ---------------------------------------- //

// -------------------------------------------- Options -------------------------------------------- //
export interface SelectOption {
    columns?: Array<string> | undefined;
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
        this.primaryNofi = data.primaryNofi;
        this.dateNofi = data.dateNofi;
        this.eventNofi = data.eventNofi;
        this.createdTime = data.createdTime;
        this.deleted = data.deleted;
        this.deletedTime = data.deletedTime;
    }
}

export class UserSQL {
    #tableName = "user";

    create(data: IUser): User {
        return new User(data);
    }

    async find(options: SelectOption): Promise<User[]> {
        const response: Array<any> = await select(this.#tableName, options);
        let result: Array<User> = [];

        if (response.length > 0) {
            for (let i = 0; i < response.length; i++) {
                result.push(this.create(response[i]));
            }
        }

        return result;
    }

    async add(user: ICreateUser): Promise<boolean> {
        const birthday = dayjs(user.birthday.valueOf()).format("YYYY-MM-DD");
        const sql = `
            INSERT INTO ${this.#tableName}
                (
                    ${UserColumn.snsId}, ${UserColumn.code}, ${UserColumn.name}, ${UserColumn.password}, ${UserColumn.email}, ${UserColumn.phone},
                    ${UserColumn.birthday}, ${UserColumn.eventNofi}
                )
                VALUES
                (
                    "${user.snsId}", "${user.code}", "${user.name}", "${user.password}",  "${user.email}", "${user.phone}",
                    "${birthday}", ${user.eventNofi}
                );
        `;

        const result: ResultSetHeader = await editWithSQL(sql);

        if (result.affectedRows <= 0) throw new InternalServerError("DB Error");

        return true;
    }

    async update(user: IUpdateUser, options: UpdateOption): Promise<boolean> {
        let sql = `UPDATE ${this.#tableName} SET `;

        if (user.name) sql += `${UserColumn.name} = "${user.name}", `;
        if (user.profile) sql += `${UserColumn.profile} = "${user.profile}", `;
        if (user.primaryNofi !== undefined) sql += `${UserColumn.primaryNofi} = ${user.primaryNofi}, `;
        if (user.dateNofi !== undefined) sql += `${UserColumn.dateNofi} = ${user.dateNofi}, `;
        if (user.eventNofi !== undefined) sql += `${UserColumn.eventNofi} = ${user.eventNofi}, `;

        sql = sql.substring(0, sql.lastIndexOf(",")) + " ";
        sql += `WHERE ${options.where};`;

        const result: ResultSetHeader = await editWithSQL(sql);

        if (result.affectedRows <= 0) throw new InternalServerError("DB Error");

        return true;
    }

    async delete() {}
}
