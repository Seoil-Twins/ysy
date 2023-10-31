import dayjs from "dayjs";
import dotenv from "dotenv";
import jwt, { JwtPayload } from "jsonwebtoken";

import UnauthorizedError from "../errors/unauthorized.error.js";
import { ResponseToken } from "../types/auth.type.js";
import { set } from "./redis.util.js";

dotenv.config();

const SECRET_KEY: string = String(process.env.AUTH_SECRET_KEY);
const ADMIN_SECRET_KEY: string = String(process.env.AUTH_SECRET_KEY);

const accessTokenOptions: object = {
  algorithm: process.env.ALGORITHM,
  expiresIn: process.env.DEVELOPMENT_ACCESSTOKEN_EXPIRES_IN,
  issuer: process.env.ISSUER
} as const;

const refreshTokenexpiresIn: object = {
  algorithm: process.env.ALGORITHM,
  expiresIn: process.env.DEVELOPMENT_JWT_REFRESHTOKEN_EXPIRES_IN
};

const accessTokenOptionsWithAdmin: object = {
  algorithm: process.env.ALGORITHM,
  expiresIn: process.env.ADMIN_ACCESSTOKEN_EXPIRES_IN,
  issuer: process.env.ISSUER
} as const;

const refreshTokenexpiresInWithAdmin: object = {
  algorithm: process.env.ALGORITHM,
  expiresIn: process.env.ADMIN_JWT_REFRESHTOKEN_EXPIRES_IN
};

const createAccessToken = (userId: number, cupId: string | null, roleId: number, isAdmin: boolean): string => {
  let payload = {
    userId,
    cupId,
    roleId,
    isAdmin
  };

  if (isAdmin) return jwt.sign(payload, ADMIN_SECRET_KEY, accessTokenOptionsWithAdmin);
  else return jwt.sign(payload, SECRET_KEY, accessTokenOptions);
};

const createRefreshToken = (isAdmin: boolean): string => {
  if (isAdmin) return jwt.sign({}, ADMIN_SECRET_KEY, refreshTokenexpiresInWithAdmin);
  else return jwt.sign({}, SECRET_KEY, refreshTokenexpiresIn);
};

const getExpired = (isAdmin: boolean): number => {
  const now = dayjs();

  if (isAdmin) {
    const expiresIn = now.add(Number(process.env.ADMIN_EX_REFRESHTOKEN_EXPIRES_IN), "day");
    return expiresIn.diff(now, "second");
  } else {
    const expiresIn = now.add(Number(process.env.DEVELOPMENT_EX_REFRESHTOKEN_EXPIRES_IN), "day");
    return expiresIn.diff(now, "second");
  }
};

export default {
  /**
   * 새로운 Access, Refresh Token을 생성 및 반환해줍니다.
   * @param userId User Id
   * @param cupId Couple Id
   * @returns A {@link ITokenResponse}
   */
  createToken: async (userId: number, cupId: string | null, role: number, isAdmin: boolean = false): Promise<ResponseToken> => {
    const accessToken: string = createAccessToken(userId, cupId, role, isAdmin);
    const refreshToken: string = createRefreshToken(isAdmin);
    const expiresIn = getExpired(isAdmin);
    // redis database에 refreshToken 저장
    const isOk = await set(String(userId), refreshToken, expiresIn);
    const result: ResponseToken = {
      accessToken
    };

    if (isOk == "OK") result.refreshToken = refreshToken;
    else result.refreshToken = "";

    return result;
  },
  /**
   * Token을 검사해 나온 Payload를 반환합니다.
   * ### Example
   * ```typescript
   * // JWT가 유효한지 검증 및 Payload를 반환합니다.
   * const result: JwtPayload | string = jwt.verify(token);
   *
   * // JWT가 만료되었더라도 JWT Payload를 가져와 반환합니다.
   * const result: JwtPayload | string = jwt.verify(token, true);
   * ```
   * @param token JWT
   * @param ignoreExpiration 유효시간이 끝난 토큰의 정보도 가져올지에 대한 여부
   * @returns A {@link jwt.JwtPayload} or string
   */
  verify: (token: string, ignoreExpiration: boolean = false, isAdmin: boolean = false): JwtPayload | string => {
    const [bearer, separatedToken] = token.split(" ");
    if (bearer !== "Bearer") throw new UnauthorizedError("Invalid Token");

    if (isAdmin) {
      const result: JwtPayload | string = jwt.verify(separatedToken, ADMIN_SECRET_KEY, { ignoreExpiration });
      return result;
    } else {
      const result: JwtPayload | string = jwt.verify(separatedToken, SECRET_KEY, { ignoreExpiration });
      return result;
    }
  }
};
