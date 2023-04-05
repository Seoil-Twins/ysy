import dayjs from "dayjs";
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

const formatDate = (results: any[]) => {
    if (!Array.isArray(results)) return;

    results.forEach((result) => {
        for (const [key, value] of Object.entries(result.dataValues)) {
            if (value instanceof Array) {
                formatDate(value);
            } else if (value instanceof Date) {
                const date = dayjs(value);
                const formatDate = date.formattedHour();
                result.dataValues[key] = date.isValid() ? formatDate : null;
            } else if (value instanceof Object) {
                // Date도 Object를 상속받기 때문에 맨 밑에 내려줘야 함.
                formatDate([value]);
            }
        }
    });
};

// 모든 모델에 대해 공통으로 사용할 수 있는 hook 함수
export const applyDateHook = (model: any) => {
    model.addHook("afterFind", (results: any) => {
        if (Array.isArray(results)) {
            formatDate(results);
        } else if (results) {
            formatDate([results]);
        }
    });
};

export default sequelize;
