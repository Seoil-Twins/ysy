import { RowDataPacket } from "mysql2";
import randomString from "randomstring";

import { USER_TABLE_NAME, CreateUser, UserColumn, createUserSql, User } from "../model/user.model";
import { insert, select, OptionType } from "../util/sql";
import { createDigest } from "../util/password";
import InternalServerError from "../error/internalServer";
import NotFoundError from "../error/notFound";

const controller = {
    getUser: async (userId: string): Promise<User> => {
        const options: OptionType = {
            table: USER_TABLE_NAME,
            column: [
                UserColumn.userId,
                UserColumn.cupId,
                UserColumn.snsId,
                UserColumn.code,
                UserColumn.name,
                UserColumn.email,
                UserColumn.birthday,
                UserColumn.phone,
                UserColumn.profile,
                UserColumn.primaryNofi,
                UserColumn.dateNofi,
                UserColumn.eventNofi
            ],
            limit: 1,
            where: `${UserColumn.userId} = "${userId}"`
        };

        const response: RowDataPacket[] = await select(options);

        if (response.length <= 0) throw new NotFoundError("Not Found User");

        const user: User = Object.assign(response[0]);

        if (user.cupId !== null) {
            // Couple Select
        }

        return user;
    },
    createUser: async (data: JSON): Promise<void> => {
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

            const response: RowDataPacket[] = await select(options);
            if (response.length <= 0) isNot = false;
        }

        const user: CreateUser = Object.assign(data);
        const hash: string = await createDigest(user.password);

        user.code = code;
        user.password = hash;

        const sql = createUserSql(user);
        const response = await insert(sql);

        if (response.affectedRows <= 0) throw new InternalServerError("DB Error");
    }
};

export default controller;
