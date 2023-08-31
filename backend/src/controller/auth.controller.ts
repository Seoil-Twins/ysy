import { User } from "../models/user.model";
import { Login, ResponseToken } from "../types/auth.type";
import { UserRole } from "../models/userRole.model";

import UnauthorizedError from "../errors/unauthorized.error";

import UserService from "../services/user.service";
import UserRoleService from "../services/userRole.service";
import AuthService from "../services/auth.service";

class AuthController {
  private authService: AuthService;
  private userService: UserService;
  private userRoleService: UserRoleService;

  constructor(authService: AuthService, userService: UserService, userRoleService: UserRoleService) {
    this.authService = authService;
    this.userService = userService;
    this.userRoleService = userRoleService;
  }

  async updateToken(accessToken: string, refreshToken: string): Promise<ResponseToken> {
    const result: ResponseToken = await this.authService.updateToken(accessToken, refreshToken);
    return result;
  }

  async login(data: Login): Promise<ResponseToken> {
    const user: User | null = await this.userService.select({ email: data.email, snsId: data.snsId });
    if (!user) throw new UnauthorizedError("Invalid Email");

    const role: UserRole | null = await this.userRoleService.select(user.userId);
    if (!role) throw new UnauthorizedError("Invalid Role");

    const result: ResponseToken = await this.authService.login(user, role);
    return result;
  }
}

export default AuthController;
