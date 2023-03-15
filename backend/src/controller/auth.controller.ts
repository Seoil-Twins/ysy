import jwt from "../util/jwt";
import dayjs from "dayjs";
import { JwtPayload } from "jsonwebtoken";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

import { User } from "../model/user.model";
import { ILogin, ITokenResponse } from "../model/auth.model";

import { checkPassword } from "../util/password";
import { get, del } from "../util/redis";

import UnauthorizedError from "../error/unauthorized";
import { UserRole } from "../model/userRole.model";
import { Role } from "../model/role.model";
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

    updateToken = async (accessToken: string, refreshToken: string): Promise<ITokenResponse> => {
        const result: ITokenResponse = await this.authService.updateToken(accessToken, refreshToken);
        return result;
    };

    login = async (data: ILogin): Promise<ITokenResponse> => {
        const user: User | null = await this.userService.getUserWithEmail(data.email);
        if (!user) throw new UnauthorizedError("Invalid Email");

        const role: UserRole | null = await this.userRoleService.getUserRole(user.userId);
        if (!role) throw new UnauthorizedError("Invalid Role");

        const result: ITokenResponse = await this.authService.login(user, role, data.password);
        return result;
    };
}

export default AuthController;
