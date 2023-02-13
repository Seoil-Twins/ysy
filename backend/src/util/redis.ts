import * as redis from "redis";
import dotenv from "dotenv";
import logger from "../logger/logger";

dotenv.config();

const username = process.env.REDIS_USERNAME;
const password = process.env.REDIS_PASSWORD;
const host = process.env.REDIS_HOST;
const port = process.env.REDIS_PORT;
const redisClient = redis.createClient({
    url: `redis://${username}:${password}@${host}:${port}`,
    legacyMode: true,
    socket: {
        connectTimeout: 50000
    }
});

redisClient.on("error : ", (err: any) => logger.error(`Redis Error : ${err}`));
redisClient.connect();

/**
 * Redis에 값을 저장합니다.
 * @param key Redis에 등록될 Key 이름
 * @param value Redis에 저장할 값
 * @param expiresIn 만료시간 (Numeric date)
 * @returns "OK" or null
 */
export const set = async (key: string, value: any, expiresIn: number): Promise<string | null> => {
    const isOk: string | null = await redisClient.v4.setEx(key, expiresIn, value);

    return isOk;
};

/**
 * Redis에 저장된 값을 가져옵니다.
 * @param key Redis에 등록된 Key 이름
 * @returns Redis Value or null
 */
export const get = async (key: string): Promise<string | null> => {
    const data: string | null = await redisClient.v4.get(key);

    return data;
};

/**
 * Redis에 저장된 값을 삭제합니다.
 * @param key Redis에 등록된 Key 이름
 * @returns 삭제된 개수(number) or null
 */
export const del = async (key: string): Promise<number | null> => {
    const data: number | null = await redisClient.v4.del(key);

    return data;
};
