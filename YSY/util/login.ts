export interface LoginOptions {
  snsId: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  birthday: string | null;
  profile: string | null;
  eventNofi: boolean;
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
    !data.profile ||
    birthdays?.length !== 3
  ) {
    return false;
  } else if (!data.eventNofi) {
    data.eventNofi = false;
  }

  return true;
};

export const appLogin = async (data: LoginOptions): Promise<AppToken> => {
  console.log(data);

  const token: AppToken = {
    accessToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjI1LCJjdXBJZCI6bnVsbCwicm9sZSI6MSwiaWF0IjoxNjgyOTI1MzUzLCJleHAiOjE2ODU1MTczNTMsImlzcyI6InlzeXVzZXIifQ.QwbRdP-l9ZGdx2lPWSPWDkKDEuP0CbxP1seHkYgOLVs',
    refreshToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjU1LCJjdXBJZCI6IjViOGhob3RmIiwicm9sZSI6NCwiaWF0IjoxNjc3Mzg3MjIwLCJleHAiOjE2Nzk5NzkyMjAsImlzcyI6InlzeXVzZXIifQ.pLz3RtqGVj49LR_FyOZa4nozxiaqMeYvhM5IL0fnXTI',
  };

  return token;
};
