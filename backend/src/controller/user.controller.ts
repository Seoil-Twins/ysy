import { RowDataPacket } from "mysql2";
import randomString from "randomstring";

import { TABLE_NAME, CreateUserModel, LoginModel, UserColumn, createUserSql } from "../model/user.model";
import { insert, select, OptionType } from "../util/sql";
import { createDigest, checkPassword } from "../util/password";
import UnauthorizedError from "../error/unauthorized";

const controller = {
    createUser: async (data: JSON) => {
        // 암호화 pw
        let isNot = true;
        let code = "";

        // 중복된 code가 있는지 검사
        while (isNot) {
            code = randomString.generate({
                length: 6,
                charset: "alphanumeric"
            });

            const options: OptionType = {
                table: TABLE_NAME,
                column: [UserColumn.code],
                limit: 1,
                where: `${UserColumn.code} = "${code}"`
            };

            let response: RowDataPacket[] = await select(options);
            if (response.length <= 0) isNot = false;
        }

        const user: CreateUserModel = Object.assign(data);
        const hash: string = await createDigest(user.password);

        user.code = code;
        user.password = hash;

        const sql = createUserSql(user);
        const response = await insert(sql);

        return response;
    },
    login: async (data: JSON) => {
        const model: LoginModel = Object.assign(data);
        const options: OptionType = {
            table: TABLE_NAME,
            column: [UserColumn.password],
            limit: 1,
            where: `${UserColumn.email} = "${model.email}"`
        };

        const response: RowDataPacket[] = await select(options);

        if (response.length <= 0) {
            throw new UnauthorizedError("Invalid Email");
        }

        const password: string = response[0].password;
        const isCheck: boolean = await checkPassword(model.password, password);

        if (!isCheck) throw new UnauthorizedError("Invalid Password");

        console.log(isCheck);
    }
};

export default controller;
