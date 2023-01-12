import { Pool, createPool, PoolConnection } from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool: Pool = createPool({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PW,
    database: process.env.MYSQL_DB,
    connectionLimit: 10,
    connectTimeout: 30,
    dateStrings: true,
    multipleStatements: true
});

const db = {
    getConnection: async (): Promise<PoolConnection> => {
        const conn: PoolConnection = await pool.getConnection();
        return conn;
    }
};

export default db;
