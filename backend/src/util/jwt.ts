import dotenv from "dotenv";
import { User } from "../model/user.model";
import jwt from "jsonwebtoken";

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
        const payload = {
            userId: user.userId,
            email: user.email
        };

        return jwt.sign(payload, SECRET_KEY, accessTokenOptions);
    },
    verify: (token: string) => {},
    createRefreshToken: (): string => {
        return jwt.sign({}, SECRET_KEY, refreshTokenexpiresIn);
    }
};
