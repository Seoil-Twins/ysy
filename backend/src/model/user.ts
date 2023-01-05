export const TABLE_NAME = "user";

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
    deletedTime: "deleted_time",
} as const;

export interface UserModel {
    user_id: string;
    cup_id: string | null;
    sns_id: string;
    code: string;
    name: string;
    password: string;
    email: string;
    birthday: Date;
    phone: string;
    profile: string;
    primary_nofi: boolean;
    date_nofi: boolean;
    event_nofi: boolean;
    created_time: Date;
    deleted: boolean;
    deleted_time: Date;
}

export interface CreateUserModel {
    sns_id: string;
    code: string;
    name: string;
    password: string;
    email: string;
    birthday: Date;
    phone: string;
    event_nofi: boolean;
}

const optionNames = {
    COLUMN: "column",
    WHERE: "where",
    ORDER_BY: "orderBy",
    LIMIT: "limit" 
} as const;

interface Option {
    column?: Array<string> | undefined;
    where?: string | undefined;
    orderBy?: string | undefined;
    limit?: number | undefined;
}

export type OptionType = Option;

export const createUserSql = (model: CreateUserModel): string => {
    const sql = `
        INSERT INTO ${TABLE_NAME}(sns_id, code, name, password, email, phone, birthday, event_nofi)
        VALUES ("${model.sns_id}", "${model.code}", "${model.name}", "${model.password}", "${model.email}", "${model.phone}",
        "${model.birthday.getFullYear()}-${model.birthday.getMonth() + 1}-${model.birthday.getUTCDate()}", ${model.event_nofi});
    `;

    return sql;
};

export const selectUserSql = (options?: OptionType): string => {
    let column: string = "*", 
        where: string = "", 
        orderBy: string = "", 
        limit: string = "";

    if (options) {
        for (const [key, value] of Object.entries(options)) {

            switch (key) {
                case optionNames.COLUMN:
                    if (value instanceof Array<string>) column = value.join(', ');
                    break;
                case optionNames.WHERE:
                    where = `where ${value}`;
                    break;
                case optionNames.ORDER_BY:
                    orderBy = `order by ${value}`;
                    break;
                case optionNames.LIMIT:
                    limit = `limit ${value}`;
                    break;
                default:
                    break;
            }
        }
    }

    const sql = `SELECT ${column} FROM ${TABLE_NAME} ${where} ${orderBy} ${limit};`;

    return sql;
};
