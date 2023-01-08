import { RowDataPacket } from "mysql2";
import randomString from "randomstring";

import { USER_TABLE_NAME, CreateUser, UserColumn, createUserSql } from "../model/user.model";
import { insert, select, OptionType } from "../util/sql";
import { createDigest } from "../util/password";

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
                table: USER_TABLE_NAME,
                column: [UserColumn.code],
                limit: 1,
                where: `${UserColumn.code} = "${code}"`
            };

            let response: RowDataPacket[] = await select(options);
            if (response.length <= 0) isNot = false;
        }

        const user: CreateUser = Object.assign(data);
        const hash: string = await createDigest(user.password);

        user.code = code;
        user.password = hash;

        const sql = createUserSql(user);
        const response = await insert(sql);

        return response;
    }
};

export default controller;
