export interface Login {
  email: string;
  snsId: string;
}

export interface ResponseToken {
  accessToken: string;
  // accessTokenExpiredAt: number; // unix timestamp
  refreshToken?: string;
}
