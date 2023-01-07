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
    deleted_time: Date | null;
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

export const createUserSql = (model: CreateUserModel): string => {
    const sql = `
        INSERT INTO ${TABLE_NAME} 
            (
                ${UserColumn.snsId}, ${UserColumn.code}, ${UserColumn.name}, ${UserColumn.password}, ${UserColumn.email}, 
                ${UserColumn.phone}, ${UserColumn.birthday}, ${UserColumn.eventNofi}
            )
        VALUES 
            (
                "${model.sns_id}", "${model.code}", "${model.name}", "${model.password}", "${model.email}", "${model.phone}",
                "${model.birthday.getFullYear()}-${model.birthday.getMonth() + 1}-${model.birthday.getUTCDate()}", ${model.event_nofi}
            );
    `;

    return sql;
};
