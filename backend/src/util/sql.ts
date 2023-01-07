import { RowDataPacket } from "mysql2";
import db from "./database";

const optionNames = {
    COLUMN: "column",
    WHERE: "where",
    ORDER_BY: "orderBy",
    LIMIT: "limit" 
} as const;

interface Option {
    table: string,
    column?: Array<string> | undefined;
    where?: string | undefined;
    orderBy?: string | undefined;
    limit?: number | undefined;
}

export type OptionType = Option;

export const select = async (options?: Option): Promise<RowDataPacket[]> => {
    const sql: string = await createSelectSql(options);
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

const createSelectSql = (options?: OptionType): string => {
    let column: string = "*", 
        where: string = "", 
        orderBy: string = "", 
        limit: string = "";

    if (options) {
        for (const [key, value] of Object.entries(options)) {

            switch (key) {
                case optionNames.COLUMN:
                    if (value instanceof Array<string>) column = value.join(', ');
                    break;
                case optionNames.WHERE:
                    where = `where ${value}`;
                    break;
                case optionNames.ORDER_BY:
                    orderBy = `order by ${value}`;
                    break;
                case optionNames.LIMIT:
                    limit = `limit ${value}`;
                    break;
                default:
                    break;
            }
        }
    }

    const sql = `SELECT ${column} FROM ${options!.table} ${where} ${orderBy} ${limit};`;

    return sql;
};
