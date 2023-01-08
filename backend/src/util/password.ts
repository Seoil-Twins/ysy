import dotenv from "dotenv";
import bcrypt from "bcrypt";

export const createDigest = async (password: string): Promise<string> => {
    dotenv.config();
    const saltRounds: number = Number(process.env.PASSWORD_SALT_ROUNDS);
    const hash: string = await bcrypt.hash(password, saltRounds);

    return hash;
};

export const checkPassword = async (inputPassword: string, dbPassword: string): Promise<boolean> => {
    const result = await bcrypt.compare(inputPassword, dbPassword);
    return result;
};
