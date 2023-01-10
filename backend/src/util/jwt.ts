import dotenv from "dotenv";
import jwt, { JwtPayload } from "jsonwebtoken";

import { User } from "../model/user.model";

dotenv.config();

const SECRET_KEY: string = String(process.env.AUTH_SECRET_KEY);
const accessTokenOptions: object = {
    algorithm: process.env.ALGORITHM,
    expiresIn: process.env.ACCESSTOKEN_EXPIRES_IN,
    issuer: process.env.ISSUER
} as const;

const refreshTokenexpiresIn: object = {
    algorithm: process.env.ALGORITHM,
    expiresIn: process.env.REFRESHTOKEN_EXPIRES_IN
};

export default {
    createAccessToken: (user: User): string => {
        const payload = { userId: user.userId };

        return jwt.sign(payload, SECRET_KEY, accessTokenOptions);
    },
    verify: (token: string, ignoreExpiration: boolean = false): JwtPayload | string => {
        const result: JwtPayload | string = jwt.verify(token, SECRET_KEY, { ignoreExpiration: ignoreExpiration });
        return result;
    },
    createRefreshToken: (): string => {
        return jwt.sign({}, SECRET_KEY, refreshTokenexpiresIn);
    }
};
