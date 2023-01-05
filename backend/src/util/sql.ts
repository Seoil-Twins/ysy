import { RowDataPacket } from "mysql2";
import db from "./database";

export const select = async (sql: string): Promise<RowDataPacket[]> => {
    const conn = await db.getConnection();
    const [row] = await conn.query<RowDataPacket[]>(sql);
    conn.release();

    return row;
};

export const insert = async (sql: string) => {
    const conn = await db.getConnection();
    const response = await conn.query(sql);
    conn.release();

    return response;
};

export const remove = (sql: string) => {
    console.log(sql);
};
