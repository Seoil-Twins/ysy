export interface LoginModel {
    email: string;
    password: string;
}

export interface LoginResponseModel {
    accessToken: string;
    accessTokenExpiredAt: number; // unix timestamp
    refreshToken: string;
    refreshTokenExpiredAt: number; // unix timestamp
}
