import randomString from "randomstring";
import { Transaction } from "sequelize";

import sequelize from "../models/index.js";
import { User } from "../models/user.model.js";
import { ResponseToken } from "../types/auth.type.js";
import { Couple } from "../models/couple.model.js";
import { CreateCouple, UpdateCouple } from "../types/couple.type.js";

import { UNKNOWN_NAME } from "../constants/file.constant.js";

import NotFoundError from "../errors/notFound.error.js";
import UnauthorizedError from "../errors/unauthorized.error.js";
import ForbiddenError from "../errors/forbidden.error.js";
import BadRequestError from "../errors/badRequest.error.js";
import ConflictError from "../errors/conflict.error.js";

import logger from "../logger/logger.js";
import jwt from "../utils/jwt.util.js";
import { File, UploadImageInfo, deleteFileWithGCP, getFileBufferWithGCP, uploadFileWithGCP } from "../utils/gcp.util.js";

import { UserRole } from "../models/userRole.model.js";

import UserService from "../services/user.service.js";
import UserRoleService from "../services/userRole.service.js";
import CoupleService from "../services/couple.service.js";

class CoupleController {
  private ERROR_LOCATION_PREFIX = "couple";
  private coupleService: CoupleService;
  private userService: UserService;
  private userRoleService: UserRoleService;

  constructor(coupleService: CoupleService, userService: UserService, userRoleService: UserRoleService) {
    this.coupleService = coupleService;
    this.userService = userService;
    this.userRoleService = userRoleService;
  }

  async getCouple(cupId: string): Promise<Couple> {
    const couple: Couple | null = await this.coupleService.selectWithUsers(cupId, this.userService.EXCLUDE_FOR_RESPONSE);
    if (!couple) throw new NotFoundError("Not Found Couple");

    return couple;
  }

  async createCouple(userId: number, data: CreateCouple, thumbnail?: File): Promise<[ResponseToken, string]> {
    let isNot = true;
    let cupId = "";
    let createdCouple: Couple | null = null;
    let transaction: Transaction | undefined = undefined;
    const user1: User | null = await this.userService.select({ userId });
    const user2: User | null = await this.userService.select({ code: data.otherCode });

    if (!user1 || !user2) throw new BadRequestError("Bad Request");
    else if (user1.cupId || user2.cupId) throw new ConflictError("Duplicated Cup Id");

    const role: UserRole | null = await this.userRoleService.select(user1.userId);
    if (!role) throw new UnauthorizedError("Invalid Role");

    try {
      transaction = await sequelize.transaction();

      while (isNot) {
        cupId = randomString.generate({
          length: 8,
          charset: "alphanumeric"
        });

        const user: User | null = await this.userService.select({ cupId });
        if (!user) isNot = false;
      }

      createdCouple = await this.coupleService.create(transaction, cupId, data, thumbnail);
      await this.userService.updateWithData(transaction, user1, { cupId });
      await this.userService.updateWithData(transaction, user2, { cupId });

      const result: ResponseToken = await jwt.createToken(userId, cupId, role.roleId);

      await transaction.commit();
      logger.debug(`Create Data => ${JSON.stringify(data)}`);

      const url: string = this.coupleService.getURL(cupId);
      return [result, url];
    } catch (error) {
      if (transaction) await transaction.rollback();

      if (createdCouple?.thumbnail) {
        await deleteFileWithGCP({
          path: createdCouple.thumbnail,
          location: `${this.ERROR_LOCATION_PREFIX}/createCouple`,
          size: createdCouple.thumbnailSize ? createdCouple.thumbnailSize : 0,
          type: createdCouple.thumbnailType ? createdCouple.thumbnailType : UNKNOWN_NAME
        });
        logger.error(`After updating the gcp, a db error occurred and the gcp thumbnail is deleted => ${createdCouple.thumbnail}`);
      }

      logger.error(`Couple create Error => ${JSON.stringify(error)}`);

      throw error;
    }
  }

  async updateCouple(userId: number, cupId: string, data: UpdateCouple, thumbnail?: File | null): Promise<Couple> {
    let transaction: Transaction | undefined = undefined;
    let updatedCouple: Couple | null = null;
    let prevFile: UploadImageInfo | null = null;

    const user: User | null = await this.userService.select({ userId });
    const couple: Couple | null = await this.coupleService.select(cupId);

    if (!user) throw new UnauthorizedError("Invalid Token (User not found using token)");
    else if (user.cupId !== cupId) throw new ForbiddenError("You don't same user couple ID and path parameter couple ID");
    if (!couple) {
      await this.userService.update(null, user, {
        cupId: null
      });

      throw new ForbiddenError("You have a wrong couple ID and deleted this couple ID");
    } else if (couple.deleted) {
      throw new ForbiddenError("Couple is deleted");
    }

    try {
      const prevThumbnailPath: string | null = couple.thumbnail;
      const prevThumbnailSize: number = couple.thumbnailSize ? couple.thumbnailSize : 0;
      const prevThumbnailType: string = couple.thumbnailType ? couple.thumbnailType : UNKNOWN_NAME;
      const prevBuffer = prevThumbnailPath ? await getFileBufferWithGCP(prevThumbnailPath) : null;

      if (prevThumbnailPath && prevBuffer) {
        prevFile = {
          filename: prevThumbnailPath,
          buffer: prevBuffer,
          mimetype: prevThumbnailType,
          size: prevThumbnailSize
        };
      }

      transaction = await sequelize.transaction();

      if (thumbnail) {
        updatedCouple = await this.coupleService.updateWithThumbnail(transaction, couple, data, thumbnail);
      } else if (thumbnail === null) {
        updatedCouple = await this.coupleService.update(transaction, couple, {
          ...data,
          thumbnail: null,
          thumbnailSize: null,
          thumbnailType: null
        });
      } else {
        updatedCouple = await this.coupleService.update(transaction, couple, data);
      }

      if (prevThumbnailPath && (thumbnail || thumbnail === null)) {
        await deleteFileWithGCP({
          path: prevThumbnailPath,
          location: `${this.ERROR_LOCATION_PREFIX}/updateCouple`,
          size: prevThumbnailSize!,
          type: prevThumbnailType!
        });
      }

      await transaction.commit();

      return updatedCouple;
    } catch (error) {
      if (transaction) await transaction.rollback();

      if (updatedCouple?.thumbnail) {
        await deleteFileWithGCP({
          path: updatedCouple.thumbnail,
          location: `${this.ERROR_LOCATION_PREFIX}/updateCouple`,
          size: updatedCouple.thumbnailSize ? updatedCouple.thumbnailSize : 0,
          type: updatedCouple.thumbnailType ? updatedCouple.thumbnailType : UNKNOWN_NAME
        });

        if (prevFile) {
          try {
            await uploadFileWithGCP({
              filename: prevFile.filename,
              buffer: prevFile.buffer,
              mimetype: prevFile.mimetype,
              size: prevFile.size
            });

            logger.error(`After updating the gcp, a db error occurred and the gcp thumbnail is reuploaded => ${updatedCouple.thumbnail}`);
          } catch (error) {
            logger.error(`Previous thumbnail upload error : ${JSON.stringify(error)}`);
          }
        }

        logger.error(`After updating the gcp, a db error occurred and the gcp thumbnail is deleted => ${updatedCouple.thumbnail}`);
      }

      logger.error(`User update error => ${JSON.stringify(error)}`);

      throw error;
    }
  }

  async deleteCouple(userId: number, roleId: number, cupId: string): Promise<ResponseToken> {
    const couple: Couple | null = await this.coupleService.selectWithUsers(cupId);
    if (!couple) throw new NotFoundError("Not found couple using token couple ID");
    else if (!couple.users) throw new NotFoundError("Not found user or another user using token couple ID");

    const user1: User = couple.users[0].userId === userId ? couple.users[0] : couple.users[1];
    const user2: User = couple.users[0].userId !== userId ? couple.users[0] : couple.users[1];

    let transaction: Transaction | undefined = undefined;

    try {
      transaction = await sequelize.transaction();

      await this.userService.update(transaction, user1, { cupId: null });
      await this.userService.update(transaction, user2, { cupId: null });
      await this.coupleService.delete(transaction, couple);

      const result: ResponseToken = await jwt.createToken(userId, null, roleId);
      await transaction.commit();
      logger.debug(`Success Update and Delete couple => ${user1.userId}, ${user2.userId}, ${cupId}`);

      return result;
    } catch (error) {
      if (transaction) await transaction.rollback();
      logger.error(`Couple (${cupId}) delete error => ${JSON.stringify(error)}`);

      throw error;
    }
  }
}

export default CoupleController;
