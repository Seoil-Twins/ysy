export interface Login {
    email: string;
    password: string;
}

export interface tokenResponse {
    accessToken: string;
    // accessTokenExpiredAt: number; // unix timestamp
    refreshToken?: string;
}
