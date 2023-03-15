import dayjs from "dayjs";
import { JwtPayload } from "jsonwebtoken";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

import UnauthorizedError from "../error/unauthorized";

import { ILogin, ITokenResponse } from "../model/auth.model";

import jwt from "../util/jwt";

import { del, get } from "../util/redis";
import { checkPassword } from "../util/password";
import { UserRole } from "../model/userRole.model";
import { User } from "../model/user.model";

dayjs.extend(isSameOrBefore);

class AuthService {
    /**
     * Access Token, Refresh Token을 새로 만듭니다.
     * @param accessToken JWT Access Token
     * @param refreshToken JWT Refresh Token
     * @returns A {@link ITokenResponse}
     */
    updateToken = async (accessToken: string, refreshToken: string): Promise<ITokenResponse> => {
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

        if (typeof accessTokenPayload === "string" || typeof refreshTokenPayload === "string") throw new UnauthorizedError("Invalid Token");

        const now = dayjs();
        const accessTokenExpiresIn = dayjs.unix(Number(accessTokenPayload.exp));
        const refreshTokenExpiresIn = dayjs.unix(Number(refreshTokenPayload.exp));
        const accessTokenIsBefore = accessTokenExpiresIn.isSameOrBefore(now);
        const refreshTokenIsBefore = refreshTokenExpiresIn.isSameOrBefore(now);

        // AccessToken Expired
        if (accessTokenIsBefore && !refreshTokenIsBefore) {
            const userId = String(accessTokenPayload.userId);
            const cupId = String(accessTokenPayload.cupId);
            const role = Number(accessTokenPayload.role);
            const refreshTokenWithRedis: string | null = await get(userId);
            refreshToken = refreshToken.replace("Bearer ", "");

            if (refreshToken === refreshTokenWithRedis) {
                const result: ITokenResponse = await jwt.createToken(Number(userId), cupId, role);

                return result;
            } else {
                if (!refreshTokenWithRedis) throw new UnauthorizedError("Wrong approach");

                await del(userId);
                throw new UnauthorizedError("Wrong approach");
            }
        } else {
            throw new UnauthorizedError("Wrong approach");
        }
    };

    /**
     * 사용자 로그인을 합니다.
     * @param data A {@link ILogin}
     * @returns A {@link ITokenResponse}
     */
    login = async (user: User, role: UserRole, password: string): Promise<ITokenResponse> => {
        const isCheck: boolean = await checkPassword(password, user.password!);
        if (!isCheck) throw new UnauthorizedError("Invalid Password");

        const result: ITokenResponse = await jwt.createToken(user.userId, user.cupId, role.roleId);
        return result;
    };
}

export default AuthService;
