export interface ILogin {
    email: string;
    password: string;
}

export interface ITokenResponse {
    accessToken: string;
    // accessTokenExpiredAt: number; // unix timestamp
    refreshToken?: string;
}
