import { authAPI } from '../apis/authAPI';

export interface LoginOptions {
  snsId: string;
  snsKind: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  birthday: string | null;
  profile?: string | null;
  eventNofi: boolean;
}

export interface Login {
  snsId: string;
  snsKind: string;
  email: string | null;
}

export interface AppToken {
  accessToken: string;
  refreshToken: string;
}

/**
 * Login에 필요한 정보들이 다 들어있는지 확인하는 메소드
 * 만약, 필요한 정보들이 다 없다면 추가 정보 페이지로 보내 부족한 정보를 입력하도록 유도
 * @param data LoginOptions
 * @returns boolean
 */
export const verifyLoginData = (data: LoginOptions): boolean => {
  const birthdays = data.birthday?.split('-');

  if (
    !data.snsId ||
    !data.email ||
    !data.name ||
    !data.phone ||
    !data.birthday ||
    birthdays?.length !== 3
  ) {
    return false;
  } else if (!data.eventNofi) {
    data.eventNofi = false;
  }

  return true;
};

export const appLogin = async (data: Login): Promise<AppToken> => {
  const token: AppToken = await authAPI.login(data);

  return token;
};
