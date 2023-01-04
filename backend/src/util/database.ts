import { Pool, createPool, PoolConnection } from "mysql2";
import dotenv from "dotenv";

dotenv.config();

// eslint-disable-next-line no-unused-vars
type callback = (conn: PoolConnection) => void;

const pool: Pool = createPool({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PW,
    database: process.env.MYSQL_DB,
    connectionLimit: 10,
    connectTimeout: 30,
});

const db = {
    getConnection: (callbackFunc: callback) => {
        pool.getConnection((err, conn: PoolConnection) => {
            if (!err) callbackFunc(conn);
            else throw err;
        });
    },
};

export default db;
