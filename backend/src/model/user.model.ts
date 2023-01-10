import { RowDataPacket } from "mysql2";
import dayjs from "dayjs";
import jsConvert from "js-convert-case";

export const USER_TABLE_NAME = "user";

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

export interface User {
    userId: string;
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

export interface CreateUser {
    snsId: string;
    code: string;
    name: string;
    password: string;
    email: string;
    birthday: Date;
    phone: string;
    eventNofi: boolean;
}

export const createUserSql = (model: CreateUser): string => {
    const birthday = dayjs(model.birthday.valueOf());

    const sql = `
        INSERT INTO ${USER_TABLE_NAME} 
            (
                ${UserColumn.snsId}, ${UserColumn.code}, ${UserColumn.name}, ${UserColumn.password}, ${UserColumn.email}, 
                ${UserColumn.phone}, ${UserColumn.birthday}, ${UserColumn.eventNofi}
            )
        VALUES 
            (
                "${model.snsId}", "${model.code}", "${model.name}", "${model.password}", "${model.email}", "${model.phone}",
                "${birthday.format("YYYY-MM-DD")}", ${model.eventNofi}
            );
    `;

    return sql;
};

export const rowDataToModel = (data: RowDataPacket[]): Array<User> => {
    const result: Array<User> = [];

    data.forEach((item: any) => {
        const convertData: object | null = jsConvert.camelKeys(item, { recursive: true });

        if (convertData) result.push(Object.assign(convertData));
    });

    return result;
};
