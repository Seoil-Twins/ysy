export interface Login {
  email: string;
  snsId: string;
  snsKind: string;
}

export interface LoginWithAdmin {
  email: string;
  password: string;
}

export interface ResponseToken {
  accessToken: string;
  // accessTokenExpiredAt: number; // unix timestamp
  refreshToken?: string;
}
