import { Op, Transaction } from "sequelize";

import { UNKNOWN_NAME } from "../constants/file.constant.js";

import logger from "../logger/logger.js";

import sequelize from "../models/index.js";
import { User } from "../models/user.model.js";
import { CreateUser, UpdateUser, ResponseUser, UpdateUserNotification } from "../types/user.type.js";

import UserService from "../services/user.service.js";
import UserRoleService from "../services/userRole.service.js";

import NotFoundError from "../errors/notFound.error.js";
import UnauthorizedError from "../errors/unauthorized.error.js";
import ForbiddenError from "../errors/forbidden.error.js";
import ConflictError from "../errors/conflict.error.js";
import { File, MimeType, UploadImageInfo, deleteFileWithGCP, getFileBufferWithGCP, uploadFileWithGCP } from "../utils/gcp.util.js";

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

  async createUser(data: CreateUser, profile?: File | string): Promise<void> {
    let transaction: Transaction | null = null;
    let createdUser: User | null = null;

    console.log(data);

    const user: User | null = await this.userService.select({
      [Op.or]: [{ email: data.email }, { phone: data.phone }]
    });
    if (user) throw new ConflictError("Duplicated User");

    try {
      transaction = await sequelize.transaction();

      if (profile) {
        createdUser = await this.userService.createWithProfile(transaction, data, profile);
      } else {
        createdUser = await this.userService.create(transaction, data);
      }

      await this.userRoleService.create(transaction, createdUser.userId, 4);
      await transaction.commit();
    } catch (error) {
      if (transaction) await transaction.rollback();

      if (createdUser?.profile) {
        await deleteFileWithGCP({
          path: createdUser.profile,
          location: `${this.ERROR_LOCATION_PREFIX}/createUser`,
          size: createdUser.profileSize!,
          type: createdUser.profileType!
        });
        logger.error(`After creating the gcp, a db error occurred and the gcp profile is deleted => ${profile}`);
      }

      logger.error(`User create error => ${JSON.stringify(error)}`);

      throw error;
    }
  }

  async updateUser(userId: number, data: UpdateUser, profile?: File | null): Promise<User> {
    let transaction: Transaction | null = null;
    let updateUser: User | null = null;
    let prevFile: UploadImageInfo | null = null;

    const userByUserId: User | null = await this.userService.select({ userId });
    if (!userByUserId) throw new NotFoundError("Not found user using token user ID");
    else if (userByUserId.deleted) throw new ForbiddenError("User is deleted");

    if (data.phone) {
      const userByPhone: User | null = await this.userService.select({ phone: data.phone });
      if (userByPhone && userByPhone.userId !== userByUserId.userId) {
        throw new ConflictError("Duplicated Phone");
      }
    }

    try {
      transaction = await sequelize.transaction();

      const prevProfilePath: string | null = userByUserId.profile;
      const prevProfileSize: number = userByUserId.profileSize ? userByUserId.profileSize : 0;
      const prevProfileType: string = userByUserId.profileType ? userByUserId.profileType : UNKNOWN_NAME;
      const prevBuffer = prevProfilePath && prevProfileType !== MimeType.URL ? await getFileBufferWithGCP(prevProfilePath) : null;

      if (prevProfilePath && prevBuffer) {
        prevFile = {
          filename: prevProfilePath,
          buffer: prevBuffer,
          mimetype: prevProfileType,
          size: prevProfileSize
        };
      }

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

      if (prevProfilePath && (profile || profile === null) && prevProfileType !== MimeType.URL) {
        await deleteFileWithGCP({
          path: prevProfilePath,
          location: `${this.ERROR_LOCATION_PREFIX}/updateUser`,
          size: prevProfileSize,
          type: prevProfileType
        });
      }

      await transaction.commit();

      return updateUser;
    } catch (error) {
      if (transaction) await transaction.rollback();

      if (updateUser?.profile) {
        await deleteFileWithGCP({
          path: updateUser.profile,
          location: `${this.ERROR_LOCATION_PREFIX}/updateUser`,
          size: updateUser.profileSize ? updateUser.profileSize : 0,
          type: updateUser.profileType ? updateUser.profileType : UNKNOWN_NAME
        });

        if (prevFile) {
          await uploadFileWithGCP({
            filename: prevFile.filename,
            buffer: prevFile.buffer,
            mimetype: prevFile.mimetype,
            size: prevFile.size
          });

          logger.error(`After updating the gcp, a db error occurred and the gcp profile is reuploaded => ${updateUser.profile}`);
        }

        logger.error(`After updating the gcp, a db error occurred and the gcp profile is deleted => ${profile}`);
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
