import randomString from "randomstring";

import { UserColumn, UserSQL, User, ICreateData, IUpdateData, UpdateOption, IDeleteData } from "../model/user.model";
import { SelectOption } from "../util/sql";
import { createDigest } from "../util/password";
import { del } from "../util/redis";
import NotFoundError from "../error/notFound";
import ForbiddenError from "../error/forbidden";
import { PoolConnection } from "mysql2/promise";
import db from "../util/database";

const controller = {
    getUser: async (userId: string): Promise<User> => {
        const conn: PoolConnection = await db.getConnection();
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

        const result: User[] = await userSQL.find(conn, options);

        if (result.length <= 0) throw new NotFoundError("Not Found User");

        if (result[0].cupId !== null) {
            // Couple Select
        }

        for (let i = 0; i < result.length; i++) delete result[i].password;

        conn.release();
        return result[0];
    },
    createUser: async (data: ICreateData): Promise<void> => {
        const conn: PoolConnection = await db.getConnection();
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

            const result: User[] = await userSQL.find(conn, options);
            if (result.length <= 0) isNot = false;
        }

        const hash: string = await createDigest(data.password);

        data.code = code;
        data.password = hash;

        await userSQL.add(conn, data);
        conn.release();
    },
    updateUser: async (data: IUpdateData): Promise<void> => {
        const conn: PoolConnection = await db.getConnection();
        const userSQL = new UserSQL();
        let selectOptions: SelectOption = {
            columns: [UserColumn.deleted],
            limit: 1,
            where: `${UserColumn.userId} = "${data.userId}"`
        };

        const result: User[] = await userSQL.find(conn, selectOptions);

        if (result.length >= 1 && result[0].deleted) throw new ForbiddenError("Forbidden Error");

        const updateOptions: UpdateOption = {
            where: `${UserColumn.userId} = "${data.userId}"`
        };

        await userSQL.update(conn, data, updateOptions);
        conn.release();
    },
    deleteUser: async (data: IDeleteData): Promise<void> => {
        const conn: PoolConnection = await db.getConnection();
        const userSQL = new UserSQL();

        await userSQL.delete(conn, data);
        await del(String(data.userId));

        conn.release();
    }
};

export default controller;
