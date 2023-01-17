import dotenv from "dotenv";
import { Sequelize } from "sequelize";

dotenv.config();

const host = String(process.env.MYSQL_HOST),
    port = Number(process.env.MYSQL_PORT),
    user = String(process.env.MYSQL_USER),
    password = String(process.env.MYSQL_PW),
    database = String(process.env.MYSQL_DB);

const sequelize = new Sequelize(database, user, password, {
    host: host,
    port: port,
    dialect: "mysql",
    pool: {
        min: 0,
        max: 10
    }
});

export default sequelize;
