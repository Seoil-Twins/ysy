import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

export const createDigest = async (password: string): Promise<string> => {
    const saltRounds: number = Number(process.env.PASSWORD_SALT_ROUNDS);
    const hash: string = await bcrypt.hash(password, saltRounds);

    return hash;
};

export const checkPassword = async (password: string): Promise<string> => {
    // db에서 password 가져와서 compare
    // result => true or false
    // const result = await bcrypt.compare(password, hash);
    return "";
};
