import dayjs from "dayjs";
import dotenv from "dotenv";
import jwt, { JwtPayload } from "jsonwebtoken";

import UnauthorizedError from "../errors/unauthorized.error";
import { ResponseToken } from "../types/auth.type";
import { set } from "./redis.util";

dotenv.config();

const SECRET_KEY: string = String(process.env.AUTH_SECRET_KEY);
const accessTokenOptions: object = {
  algorithm: process.env.ALGORITHM,
  expiresIn: process.env.DEVELOPMENT_ACCESSTOKEN_EXPIRES_IN,
  issuer: process.env.ISSUER
} as const;

const refreshTokenexpiresIn: object = {
  algorithm: process.env.ALGORITHM,
  expiresIn: process.env.DEVELOPMENT_JWT_REFRESHTOKEN_EXPIRES_IN
};

const createAccessToken = (userId: number, cupId: string | null, role: number): string => {
  let payload = {
    userId,
    cupId,
    role
  };

  return jwt.sign(payload, SECRET_KEY, accessTokenOptions);
};

const createRefreshToken = (): string => {
  return jwt.sign({}, SECRET_KEY, refreshTokenexpiresIn);
};

const getExpired = (): number => {
  const now = dayjs();
  const expiresIn = now.add(Number(process.env.DEVELOPMENT_EX_REFRESHTOKEN_EXPIRES_IN), "day");

  return expiresIn.diff(now, "second");
};

export default {
  /**
   * 새로운 Access, Refresh Token을 생성 및 반환해줍니다.
   * @param userId User Id
   * @param cupId Couple Id
   * @returns A {@link ITokenResponse}
   */
  createToken: async (userId: number, cupId: string | null, role: number): Promise<ResponseToken> => {
    const accessToken: string = createAccessToken(userId, cupId, role);
    const refreshToken: string = createRefreshToken();
    const expiresIn = getExpired();
    // redis database에 refreshToken 저장
    const isOk = await set(String(userId), refreshToken, expiresIn);
    const result: ResponseToken = {
      accessToken: accessToken
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
   * @param ignoreExpiration 유효시간이 끝난 토큰의 정보
   * @returns A {@link JwtPayload} or string
   */
  verify: (token: string, ignoreExpiration: boolean = false): JwtPayload | string => {
    const [bearer, separatedToken] = token.split(" ");
    if (bearer !== "Bearer") throw new UnauthorizedError("Invalid Token");

    const result: JwtPayload | string = jwt.verify(separatedToken, SECRET_KEY, { ignoreExpiration: ignoreExpiration });

    return result;
  }
};
