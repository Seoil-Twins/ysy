import { RowDataPacket } from "mysql2";
import randomString from "randomstring";

import { CreateUserModel, OptionType, UserColumn, createUserSql, selectUserSql } from "../model/user";
import { insert, select } from "../util/sql";

const controller = {
    createUser: async (data: JSON) => {
        let isNot = true;
        let code = "";
        
        // 중복된 code가 있는지 검사
        while (isNot) {
            code = randomString.generate({
                length: 6,
                charset: "alphanumeric"
            });

            const options: OptionType = {
                column: [UserColumn.code],
                limit: 1,
                where: `${UserColumn.code} = "${code}"`
            };

            let sql: string = selectUserSql(options);
            let response: RowDataPacket[] = await select(sql);

            if (response.length <= 0) isNot = false;
        }
        
        const user: CreateUserModel = Object.assign(data);
        user.code = code;

        const sql = createUserSql(user);
        const response = await insert(sql);

        return response;
    }
};

export default controller;
