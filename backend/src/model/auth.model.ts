export interface Login {
    email: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    accessTokenExpiredAt: number; // unix timestamp
    refreshToken?: string;
}
