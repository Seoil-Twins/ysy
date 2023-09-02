import dayjs from "dayjs";
import { JwtPayload } from "jsonwebtoken";

import UnauthorizedError from "../errors/unauthorized.error";

import { Login, ResponseToken } from "../types/auth.type";

import jwt from "../utils/jwt.util";
import { del, get } from "../utils/redis.util";

import { UserRole } from "../models/userRole.model";
import { User } from "../models/user.model";

class AuthService {
  /**
   * Access Token, Refresh Token을 새로 만듭니다.
   *
   * RTR : Refresh Token Rotation
   *
   * Refresh Token이 Access Token을 발급했다면 Refresh Token도 재발행 (1회용)
   *
   * 1. Access Expired, Refresh 살아있고 Redis와 일치하다면 발급
   * 2. Access Expired, Refresh Expired => Error
   * 3. Header Refresh, Redis Refresh Not matched => Error
   * @param accessToken JWT Access Token
   * @param refreshToken JWT Refresh Token
   * @returns A {@link ResponseToken}
   */
  async updateToken(accessToken: string, refreshToken: string): Promise<ResponseToken> {
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
        const result: ResponseToken = await jwt.createToken(Number(userId), cupId, role);

        return result;
      } else {
        if (!refreshTokenWithRedis) throw new UnauthorizedError("Wrong approach");

        await del(userId);
        throw new UnauthorizedError("Wrong approach");
      }
    } else {
      throw new UnauthorizedError("Wrong approach");
    }
  }

  /**
   * 사용자 로그인을 합니다.
   * @param data {@link Login} - 로그인을 위한 인터페이스
   * @returns A {@link ResponseToken}
   */
  async login(user: User, role: UserRole): Promise<ResponseToken> {
    const result: ResponseToken = await jwt.createToken(user.userId, user.cupId, role.roleId);
    return result;
  }
}

export default AuthService;
