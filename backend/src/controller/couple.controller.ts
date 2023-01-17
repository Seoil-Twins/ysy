import randomString from "randomstring";
import { CoupleColumn, CoupleSQL, ICreateData, SelectOption, UpdateOption } from "../model/couple.model";
import { IUpdateWithCupIdData, User, UserColumn, UserSQL } from "../model/user.model";
import db from "../util/database";

const userSQL = new UserSQL();
const coupleSQL = new CoupleSQL();

const controller = {
    createCouple: async (data: ICreateData): Promise<void> => {
        const conn = await db.getConnection();

        try {
            await conn.beginTransaction();

            let isNot = true;
            let cupId = "";

            // 중복된 Id인지 검사
            while (isNot) {
                cupId = randomString.generate({
                    length: 8,
                    charset: "alphanumeric"
                });

                const options: SelectOption = {
                    columns: [UserColumn.cupId],
                    limit: 1,
                    where: `${CoupleColumn.cupId} = "${cupId}"`
                };

                const result: User[] = await userSQL.find(conn, options);
                if (result.length <= 0) isNot = false;
            }

            data.cupId = cupId;
            await coupleSQL.add(conn, data);

            const sqlData: IUpdateWithCupIdData = { cupId: cupId };

            let options: UpdateOption = { where: `${UserColumn.userId} = ${data.userId}` };
            await userSQL.updateWithCupId(conn, sqlData, options);

            options = { where: `${UserColumn.userId} = ${data.userId2}` };
            await userSQL.updateWithCupId(conn, sqlData, options);

            await conn.commit();
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    }
};

export default controller;
