import dotenv from "dotenv";
import jwt, { JwtPayload } from "jsonwebtoken";

dotenv.config();

const SECRET_KEY: string = String(process.env.AUTH_SECRET_KEY);
const accessTokenOptions: object = {
    algorithm: process.env.ALGORITHM,
    // expiresIn: process.env.ACCESSTOKEN_EXPIRES_IN,
    expiresIn: "3s",
    issuer: process.env.ISSUER
} as const;

const refreshTokenexpiresIn: object = {
    algorithm: process.env.ALGORITHM,
    // expiresIn: process.env.REFRESHTOKEN_EXPIRES_IN
    expiresIn: "1m"
};

export default {
    createAccessToken: (userId: string): string => {
        let payload = { userId: userId };

        return jwt.sign(payload, SECRET_KEY, accessTokenOptions);
    },
    createRefreshToken: (): string => {
        return jwt.sign({}, SECRET_KEY, refreshTokenexpiresIn);
    },
    verify: (token: string, ignoreExpiration: boolean = false): JwtPayload | string => {
        const result: JwtPayload | string = jwt.verify(token, SECRET_KEY, { ignoreExpiration: ignoreExpiration });
        return result;
    }
};
