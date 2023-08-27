import { User } from "../model/user.model";
import { ILogin, ITokenResponse } from "../model/auth.model";
import { UserRole } from "../model/userRole.model";

import UnauthorizedError from "../error/unauthorized.error";

import UserService from "../service/user.service";
import UserRoleService from "../service/userRole.service";
import AuthService from "../service/auth.service";

class AuthController {
    private authService: AuthService;
    private userService: UserService;
    private userRoleService: UserRoleService;

    constructor(authService: AuthService, userService: UserService, userRoleService: UserRoleService) {
        this.authService = authService;
        this.userService = userService;
        this.userRoleService = userRoleService;
    }

    async updateToken(accessToken: string, refreshToken: string): Promise<ITokenResponse> {
        const result: ITokenResponse = await this.authService.updateToken(accessToken, refreshToken);
        return result;
    }

    async login(data: ILogin): Promise<ITokenResponse> {
        const user: User | null = await this.userService.select({ email: data.email });
        if (!user) throw new UnauthorizedError("Invalid Email");

        const role: UserRole | null = await this.userRoleService.select(user.userId);
        if (!role) throw new UnauthorizedError("Invalid Role");

        const result: ITokenResponse = await this.authService.login(user, role, data.password);
        return result;
    }
}

export default AuthController;
