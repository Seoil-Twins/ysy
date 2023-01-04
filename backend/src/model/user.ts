export const TABLE_NAME = "user";

export interface CreateUserModel {
    sns_id: string;
    name: string;
    password: string;
    email: string;
    birthday: Date;
    phone: string;
    event_nofi: boolean;
}

export const createUserSql = (model: CreateUserModel) => {
    const sql = `
        INSERT INTO user(sns_id, code, name, password, email, phone, birthday, event_nofi)
        VALUES ("${model.sns_id}", "ASD41S", "${model.name}", "${model.password}", "${model.email}", "${model.phone}",
        "${model.birthday.getFullYear()}-${model.birthday.getMonth() + 1}-${model.birthday.getUTCDate()}", ${model.event_nofi});
    `;

    return sql;
};
