import bcrypt from "bcrypt";

/**
 * 유저의 비밀번호를 암호화시켜 반환합니다.
 * @param password User Password
 * @returns Crypto password
 */
export const createDigest = async (password: string): Promise<string> => {
  const saltRounds: number = Number(process.env.PASSWORD_SALT_ROUNDS);
  const hash: string = await bcrypt.hash(password, saltRounds);

  return hash;
};

/**
 * 사용자가 입력한 비밀번호와 DB에 저장된 비밀번호가 같은지 확인합니다.
 * @param inputPassword 사용자가 입력한 비밀번호
 * @param dbPassword DB에 저장된 암호화 비밀번호
 * @returns true or false
 */
export const checkPassword = async (inputPassword: string, dbPassword: string): Promise<boolean> => {
  const result = await bcrypt.compare(inputPassword, dbPassword);
  return result;
};
