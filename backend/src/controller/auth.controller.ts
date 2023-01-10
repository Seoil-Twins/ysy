import { RowDataPacket } from "mysql2";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

import { USER_TABLE_NAME, UserColumn, User, rowDataToModel } from "../model/user.model";
import { Login, tokenResponse } from "../model/auth.model";
import { select, OptionType } from "../util/sql";
import { checkPassword } from "../util/password";
import jwt from "../util/jwt";
import { set, get, del } from "../util/redis";
import UnauthorizedError from "../error/unauthorized";
import { JwtPayload } from "jsonwebtoken";

// dayjs에 isSameOrBefore 함수 추가
dayjs.extend(isSameOrBefore);

const controller = {
    updateToken: async (accessToken: string, refreshToken: string) => {
        /**
         * RTR : Refresh Token Rotation
         * Refresh Token이 Access Token을 발급했다면 Refresh Token도 재발행 (1회용)
         *
         * 1. Access Expired, Refresh 살아있고 Redis와 일치하다면 발급
         * 2. Access Expired, Refresh Expired => Error
         * 3. Header Refresh, Redis Refresh Not matched => Error
         */
        const accessTokenPayload: JwtPayload | string = jwt.verify(accessToken, true);
        const refreshTokenPayload: JwtPayload | string = jwt.verify(refreshToken, true);

        if (typeof accessTokenPayload === "string" || typeof refreshTokenPayload === "string") throw new UnauthorizedError("Invalida Token");

        const now = dayjs();
        const accessTokenExpiresIn = dayjs.unix(Number(accessTokenPayload.exp));
        const refreshTokenExpiresIn = dayjs.unix(Number(refreshTokenPayload.exp));
        const accessTokenIsBefore = accessTokenExpiresIn.isSameOrBefore(now);
        const refreshTokenIsBefore = refreshTokenExpiresIn.isSameOrBefore(now);

        // AccessToken Expired
        if (accessTokenIsBefore && !refreshTokenIsBefore) {
            const userId = String(accessTokenPayload.userId);
            const refreshTokenWithRedis: string | null = await get(userId);

            if (refreshToken === refreshTokenWithRedis) {
                const newAccessToken = jwt.createAccessToken(userId);
                const newRefreshToken = jwt.createRefreshToken();
                const expiresIn = jwt.getExpired();
                const result: tokenResponse = {
                    accessToken: newAccessToken
                };

                const isOk = await set(userId, newRefreshToken, expiresIn);

                if (isOk == "OK") result.refreshToken = newRefreshToken;
                else result.refreshToken = "";

                return result;
            } else {
                if (!refreshTokenWithRedis) throw new UnauthorizedError("Re Login");

                await del(userId);
                throw new UnauthorizedError("Re Login");
            }
        } else {
            throw new UnauthorizedError("Re Login");
        }
    },
    login: async (data: JSON) => {
        const loginRequest: Login = Object.assign(data);
        const options: OptionType = {
            table: USER_TABLE_NAME,
            where: `${UserColumn.email} = "${loginRequest.email}"`
        };

        const response: RowDataPacket[] = await select(options);

        if (response.length <= 0) throw new UnauthorizedError("Invalid Email");

        const user: Array<User> = rowDataToModel(response);
        const isCheck: boolean = await checkPassword(loginRequest.password, user[0].password);

        if (!isCheck) throw new UnauthorizedError("Invalid Password");

        const accessToken: string = jwt.createAccessToken(user[0].userId);
        const refreshToken: string = jwt.createRefreshToken();
        const expiresIn = jwt.getExpired();

        // redis database에 refreshToken 저장
        const isOk = await set(String(user[0].userId), refreshToken, expiresIn);

        const result: tokenResponse = {
            accessToken: accessToken
        };

        if (isOk == "OK") result.refreshToken = refreshToken;
        else result.refreshToken = "";

        return result;
    }
};

export default controller;
