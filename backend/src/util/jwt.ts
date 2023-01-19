import dayjs from "dayjs";
import dotenv from "dotenv";
import jwt, { JwtPayload } from "jsonwebtoken";

import UnauthorizedError from "../error/unauthorized";
import { ITokenResponse } from "../model/auth.model";
import { set } from "./redis";

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

const createAccessToken = (userId: number, cupId: string | null): string => {
    let payload = {
        userId: userId,
        cupId: cupId
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
    createToken: async (userId: number, cupId: string | null): Promise<ITokenResponse> => {
        const accessToken: string = createAccessToken(userId, cupId);
        const refreshToken: string = createRefreshToken();
        const expiresIn = getExpired();
        // redis database에 refreshToken 저장
        const isOk = await set(String(userId), refreshToken, expiresIn);
        const result: ITokenResponse = {
            accessToken: accessToken
        };

        if (isOk == "OK") result.refreshToken = refreshToken;
        else result.refreshToken = "";

        return result;
    },
    verify: (token: string, ignoreExpiration: boolean = false): JwtPayload | string => {
        const [bearer, separatedToken] = token.split(" ");
        if (bearer !== "Bearer") throw new UnauthorizedError("Invalid Token");

        const result: JwtPayload | string = jwt.verify(separatedToken, SECRET_KEY, { ignoreExpiration: ignoreExpiration });

        return result;
    }
};
