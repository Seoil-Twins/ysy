import { Op, Transaction } from "sequelize";
import { File } from "formidable";

import { UNKNOWN_NAME } from "../constants/file.constant";

import logger from "../logger/logger";
import { deleteFile } from "../utils/firebase.util";

import sequelize from "../models";
import { User } from "../models/user.model";
import { CreateUser, UpdateUser, ResponseUser, UpdateUserNotification } from "../types/user.type";

import UserService from "../services/user.service";
import UserRoleService from "../services/userRole.service";

import NotFoundError from "../errors/notFound.error";
import UnauthorizedError from "../errors/unauthorized.error";
import ForbiddenError from "../errors/forbidden.error";
import ConflictError from "../errors/conflict.error";

class UserController {
  private ERROR_LOCATION_PREFIX = "user";
  private userService: UserService;
  private userRoleService: UserRoleService;

  constructor(userService: UserService, userRoleService: UserRoleService) {
    this.userService = userService;
    this.userRoleService = userRoleService;
  }

  async getUser(userId: number): Promise<ResponseUser> {
    const result: ResponseUser | null = await this.userService.selectForResponse(userId);

    if (!result) {
      throw new UnauthorizedError("User not found with given ID");
    }

    return result;
  }

  async createUser(data: CreateUser, profile?: File): Promise<string> {
    let transaction: Transaction | null = null;
    let createdUser: User | null = null;

    const user: User | null = await this.userService.select({
      [Op.or]: [{ email: data.email }, { phone: data.phone }]
    });
    if (user) throw new ConflictError("Duplicated User");

    try {
      transaction = await sequelize.transaction();
      createdUser = await this.userService.create(transaction, data, profile);

      await this.userRoleService.create(transaction, createdUser.userId, 4);
      await transaction.commit();

      const url: string = this.userService.getURL();
      return url;
    } catch (error) {
      if (transaction) await transaction.rollback();

      if (createdUser?.profile) {
        await deleteFile({
          path: createdUser.profile,
          location: `${this.ERROR_LOCATION_PREFIX}/createUser`,
          size: createdUser.profileSize ? createdUser.profileSize : 0,
          type: createdUser.profileType ? createdUser.profileType : UNKNOWN_NAME
        });
        logger.error(`After creating the firebase, a db error occurred and the firebase profile is deleted => ${profile}`);
      }

      logger.error(`User create error => ${JSON.stringify(error)}`);

      throw error;
    }
  }

  async updateUser(userId: number, data: UpdateUser, profile?: File | null): Promise<User> {
    let transaction: Transaction | null = null;
    let updateUser: User | null = null;

    const userByUserId: User | null = await this.userService.select({ userId });
    if (!userByUserId) throw new NotFoundError("Not found user using token user ID");
    else if (userByUserId.deleted) throw new ForbiddenError("User is deleted");

    if (data.phone) {
      const userByPhone: User | null = await this.userService.select({ phone: data.phone });
      if (userByPhone) {
        throw new ConflictError("Duplicated Phone");
      }
    }

    try {
      transaction = await sequelize.transaction();
      const prevProfilePath: string | null = userByUserId.profile;
      const prevProfileSize: number = userByUserId.profileSize ? userByUserId.profileSize : 0;
      const prevProfileType: string = userByUserId.profileType ? userByUserId.profileType : UNKNOWN_NAME;

      if (profile) {
        updateUser = await this.userService.updateWithProfile(transaction, userByUserId, data, profile);
      } else if (profile === null) {
        updateUser = await this.userService.update(transaction, userByUserId, {
          ...data,
          profile: null,
          profileSize: null,
          profileType: null
        });
      } else {
        updateUser = await this.userService.update(transaction, userByUserId, data);
      }

      await transaction.commit();

      if (prevProfilePath && (profile || profile === null)) {
        await deleteFile({
          path: prevProfilePath,
          location: `${this.ERROR_LOCATION_PREFIX}/updateUser`,
          size: prevProfileSize,
          type: prevProfileType
        });
      }

      return updateUser;
    } catch (error) {
      if (transaction) await transaction.rollback();

      // Firebase에는 업로드 되었지만 DB 오류가 발생했다면 Firebase Profile 삭제
      if (updateUser?.profile) {
        await deleteFile({
          path: updateUser.profile,
          location: `${this.ERROR_LOCATION_PREFIX}/updateUser`,
          size: updateUser.profileSize ? updateUser.profileSize : 0,
          type: updateUser.profileType ? updateUser.profileType : UNKNOWN_NAME
        });
        logger.error(`After updating the firebase, a db error occurred and the firebase profile is deleted => ${profile}`);
      }

      throw error;
    }
  }

  async updateUserNotification(userId: number, data: UpdateUserNotification): Promise<User> {
    const user: User | null = await this.userService.select({ userId });

    if (!user) throw new NotFoundError("Not found user using token user ID");
    else if (user.deleted) throw new ForbiddenError("User is deleted");

    const updatedUser: User = await this.userService.update(null, user, data);
    return updatedUser;
  }

  async deleteUser(userId: number): Promise<void> {
    let transaction: Transaction | null = null;

    const user: User | null = await this.userService.select({ userId });
    if (!user) throw new NotFoundError("Not found user using user ID");
    else if (user.deleted) return;

    try {
      transaction = await sequelize.transaction();
      await this.userService.delete(transaction, user);
      await transaction.commit();
    } catch (error) {
      if (transaction) await transaction.rollback();
      logger.error(`User delete error => ${JSON.stringify(error)}`);

      throw error;
    }
  }
}

export default UserController;
