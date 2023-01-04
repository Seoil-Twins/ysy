import db from "./database";

export const select = (model: any) => {
    console.log(model);
};

export const insert = async (sql: string) => {
    const conn = await db.getConnection();
    const response = await conn.query(sql);

    return response;
};

export const remove = (model: any) => {
    console.log(model);
};
