import jsConvert from "js-convert-case";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { PoolConnection } from "mysql2/promise";
import InternalServerError from "../error/internalServer";
import db from "./database";

const optionNames = {
    COLUMN: "column",
    VALUES: "values",
    WHERE: "where",
    ORDER_BY: "orderBy",
    LIMIT: "limit"
} as const;

export interface SelectOption {
    columns?: string[] | undefined;
    where?: string | undefined;
    orderBy?: string | undefined;
    limit?: number | undefined;
}

export const select = async (conn: PoolConnection, tableName: string, options: SelectOption): Promise<RowDataPacket[]> => {
    const sql: string = createSelectSql(tableName, options);
    const [row] = await conn.query<RowDataPacket[]>(sql);

    const result: RowDataPacket[] = rowDataToModel(row);

    return result;
};

export const edit = async (conn: PoolConnection, sql: string): Promise<void> => {
    const count = sql.split(";").length - 1;
    const [response] = await conn.query<ResultSetHeader>(sql);

    if (response.affectedRows < count) {
        throw new InternalServerError("DB Error");
    }
};

const createSelectSql = (tableName: string, options: SelectOption): string => {
    let columns: string = "*",
        where: string = "",
        orderBy: string = "",
        limit: string = "";

    for (const [key, value] of Object.entries(options)) {
        switch (key) {
            case optionNames.COLUMN:
                if (value instanceof Array<string>) columns = value.join(", ");
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

    const sql = `SELECT ${columns} FROM ${tableName} ${where} ${orderBy} ${limit};`;

    return sql;
};

const rowDataToModel = (data: RowDataPacket[]): RowDataPacket[] => {
    const result: RowDataPacket[] = [];

    data.forEach((item: RowDataPacket) => {
        const convertData: object | null = jsConvert.camelKeys(item, { recursive: true });

        if (convertData) result.push(Object.assign(convertData));
    });

    return result;
};
