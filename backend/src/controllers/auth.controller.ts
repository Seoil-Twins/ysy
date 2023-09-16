import { User } from "../models/user.model.js";
import { Login, ResponseToken } from "../types/auth.type.js";
import { UserRole } from "../models/userRole.model.js";

import UnauthorizedError from "../errors/unauthorized.error.js";
import NotFoundError from "../errors/notFound.error.js";

import UserService from "../services/user.service.js";
import UserRoleService from "../services/userRole.service.js";
import AuthService from "../services/auth.service.js";

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
    const user: User | null = await this.userService.select({ email: data.email, snsId: data.snsId, snsKind: data.snsKind });
    if (!user) throw new NotFoundError("Not found user using request");

    const role: UserRole | null = await this.userRoleService.select(user.userId);
    if (!role) throw new UnauthorizedError("User information is invalid. Please contact the backend developer.");

    const result: ResponseToken = await this.authService.login(user, role);
    return result;
  }
}

export default AuthController;
