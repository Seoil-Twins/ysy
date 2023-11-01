import dayjs from "dayjs";
import { JwtPayload } from "jsonwebtoken";

import UnauthorizedError from "../errors/unauthorized.error.js";

import { Login, ResponseToken } from "../types/auth.type.js";

import jwt from "../utils/jwt.util.js";
import { del, get } from "../utils/redis.util.js";

import { UserRole } from "../models/userRole.model.js";
import { User } from "../models/user.model.js";

class AuthAdminService {
  async updateToken(accessToken: string, refreshToken: string): Promise<ResponseToken> {
    const accessTokenPayload: JwtPayload | string = jwt.verify(accessToken, true, true);
    const refreshTokenPayload: JwtPayload | string = jwt.verify(refreshToken, true, true);

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
        const result: ResponseToken = await jwt.createToken(Number(userId), cupId, role, true);

        return result;
      } else {
        if (!refreshTokenWithRedis) throw new UnauthorizedError("Wrong approach");

        await del(userId);
        throw new UnauthorizedError("Wrong approach");
      }
    } else if (!accessTokenIsBefore && !refreshTokenIsBefore) {
      throw new UnauthorizedError("Expired accesstoken and refreshtoken. Please relogin.");
    } else {
      throw new UnauthorizedError("Wrong approach");
    }
  }

  /**
   * 관리자 로그인을 합니다.
   * @param data {@link Login} - 로그인을 위한 인터페이스
   * @returns A {@link ResponseToken}
   */
  async login(user: User, role: UserRole): Promise<ResponseToken> {
    const result: ResponseToken = await jwt.createToken(user.userId, user.cupId, role.roleId, true);
    return result;
  }
}

export default AuthAdminService;
