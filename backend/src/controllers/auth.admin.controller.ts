import { User } from "../models/user.model.js";
import { LoginWithAdmin, ResponseToken } from "../types/auth.type.js";
import { UserRole } from "../models/userRole.model.js";

import UnauthorizedError from "../errors/unauthorized.error.js";
import NotFoundError from "../errors/notFound.error.js";

import UserService from "../services/user.service.js";
import UserRoleService from "../services/userRole.service.js";
import AuthAdminService from "../services/auth.admin.service.js";
import AdminService from "../services/admin.service.js";
import { Admin } from "../models/admin.model.js";
import { checkPassword } from "../utils/password.util.js";

class AuthAdminController {
  private authAdminService: AuthAdminService;
  private userService: UserService;
  private userRoleService: UserRoleService;
  private adminService: AdminService;

  constructor(authAdminService: AuthAdminService, userService: UserService, userRoleService: UserRoleService, adminService: AdminService) {
    this.authAdminService = authAdminService;
    this.userService = userService;
    this.userRoleService = userRoleService;
    this.adminService = adminService;
  }

  async updateToken(accessToken: string, refreshToken: string): Promise<ResponseToken> {
    const result: ResponseToken = await this.authAdminService.updateToken(accessToken, refreshToken);
    return result;
  }

  async login(data: LoginWithAdmin): Promise<ResponseToken> {
    const user: User | null = await this.userService.select({ email: data.email });
    if (!user) throw new NotFoundError("Not found user using request");

    const role: UserRole | null = await this.userRoleService.select(user.userId);
    if (!role) throw new UnauthorizedError("User information is invalid. Please contact the backend developer.");

    const admin: Admin | null = await this.adminService.select({ userId: user.userId });
    if (!admin) throw new NotFoundError("Not found admin");

    const isValid = await checkPassword(data.password, admin.password);
    if (!isValid) throw new UnauthorizedError("Invalid password");

    const result: ResponseToken = await this.authAdminService.login(user, role);
    return result;
  }
}

export default AuthAdminController;
