import { ResultSetHeader, RowDataPacket } from "mysql2";
import randomString from "randomstring";

import { UserColumn, UserSQL, User, ICreateUser, IUpdateUser, UpdateOption } from "../model/user.model";
import { SelectOption } from "../util/sql";
import { createDigest } from "../util/password";
import InternalServerError from "../error/internalServer";
import NotFoundError from "../error/notFound";

const controller = {
    getUser: async (userId: string): Promise<User> => {
        const userSQL = new UserSQL();
        const options: SelectOption = {
            columns: [
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

        const result: User[] = await userSQL.find(options);

        if (result.length <= 0) throw new NotFoundError("Not Found User");

        if (result[0].cupId !== null) {
            // Couple Select
        }

        for (let i = 0; i < result.length; i++) delete result[i].password;

        return result[0];
    },
    createUser: async (data: ICreateUser): Promise<void> => {
        // 암호화 pw
        const userSQL = new UserSQL();
        let isNot = true;
        let code = "";

        // 중복된 code가 있는지 검사
        while (isNot) {
            code = randomString.generate({
                length: 6,
                charset: "alphanumeric"
            });

            const options: SelectOption = {
                columns: [UserColumn.code],
                limit: 1,
                where: `${UserColumn.code} = "${code}"`
            };

            const result: User[] = await userSQL.find(options);
            if (result.length <= 0) isNot = false;
        }

        const hash: string = await createDigest(data.password);

        data.code = code;
        data.password = hash;

        const result: boolean = await userSQL.add(data);

        if (!result) throw new InternalServerError("DB Error");
    },
    updateUser: async (data: IUpdateUser): Promise<void> => {
        const userSQL = new UserSQL();
        const options: UpdateOption = {
            where: `${UserColumn.userId} = "${data.userId}"`
        };

        const result: boolean = await userSQL.update(data, options);

        if (!result) throw new InternalServerError("DB Error");
    }
};

export default controller;
