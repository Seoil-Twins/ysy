import { CreateUserModel, createUserSql } from "../model/user";
import { insert } from "../util/sql";

const controller = {
    createUser: async (data: JSON) => {
        const user: CreateUserModel = Object.assign(data);
        const sql: string = createUserSql(user);
        const response = await insert(sql);

        return response;
    }
};

export default controller;
