import randomString from "randomstring";
import { Transaction } from "sequelize";
import { File } from "formidable";

import sequelize from "../model";
import { User } from "../model/user.model";
import { ITokenResponse } from "../model/auth.model";
import { Couple, IRequestCreate, IUpdateWithController, IUpdateWithService } from "../model/couple.model";

import NotFoundError from "../error/notFound.error";
import UnauthorizedError from "../error/unauthorized.error";
import ForbiddenError from "../error/forbidden.error";
import BadRequestError from "../error/badRequest.error";
import ConflictError from "../error/conflict.error";

import logger from "../logger/logger";
import jwt from "../util/jwt.util";
import { UserRole } from "../model/userRole.model";

import UserService from "../service/user.service";
import UserRoleService from "../service/userRole.service";
import CoupleService from "../service/couple.service";
import { deleteFile } from "../util/firebase.util";

class CoupleController {
    private coupleService: CoupleService;
    private userService: UserService;
    private userRoleService: UserRoleService;

    constructor(coupleService: CoupleService, userService: UserService, userRoleService: UserRoleService) {
        this.coupleService = coupleService;
        this.userService = userService;
        this.userRoleService = userRoleService;
    }

    async getCouple(cupId: string): Promise<Couple> {
        const couple: Couple | null = await this.coupleService.select(cupId, ["password"]);
        if (!couple) throw new NotFoundError("Not Found Couple");

        return couple;
    }

    async createCouple(data: IRequestCreate, file?: File): Promise<[ITokenResponse, string]> {
        let isNot = true;
        let cupId = "";
        let createdCouple: Couple | null = null;
        let transaction: Transaction | undefined = undefined;

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

            createdCouple = await this.coupleService.create(transaction, cupId, data, file);
            const user1: User | null = await this.userService.select({ userId: data.userId });
            const user2: User | null = await this.userService.select({ userId: data.userId2 });

            if (!user1 || !user2) throw new BadRequestError("Bad Request");
            else if (user1.cupId || user2.cupId) throw new ConflictError("Duplicated Cup Id");

            await this.userService.update(transaction, user1, {
                cupId: createdCouple.cupId
            });

            await this.userService.update(transaction, user2, {
                cupId: createdCouple.cupId
            });

            const role: UserRole | null = await this.userRoleService.select(user1.userId);
            if (!role) throw new UnauthorizedError("Invalid Role");

            const result: ITokenResponse = await jwt.createToken(data.userId, cupId, role.roleId);

            await transaction.commit();
            logger.debug(`Create Data => ${JSON.stringify(data)}`);

            const url: string = this.coupleService.getURL(cupId);

            return [result, url];
        } catch (error) {
            if (createdCouple?.thumbnail) {
                deleteFile(createdCouple.thumbnail);
                logger.error(`After updating the firebase, a db error occurred and the firebase thumbnail is deleted => ${createdCouple.thumbnail}`);
            }
            if (transaction) await transaction.rollback();
            logger.error(`Couple create Error => ${JSON.stringify(error)}`);

            throw error;
        }
    }

    async updateCouple(data: IUpdateWithController, thumbnail?: File): Promise<Couple> {
        let transaction: Transaction | undefined = undefined;
        let updatedCouple: Couple | null = null;
        const user: User | null = await this.userService.select({ userId: data.userId });

        if (!user) throw new UnauthorizedError("Invalid Token (User not found using token)");
        else if (user.cupId !== data.cupId) throw new ForbiddenError("You don't same user couple ID and path parameter couple ID");

        try {
            transaction = await sequelize.transaction();

            const couple: Couple | null = await this.coupleService.select(data.cupId);
            const prevThumbnail: string | null | undefined = couple?.thumbnail;

            if (!couple) {
                await this.userService.update(transaction, user, {
                    cupId: null
                });

                throw new ForbiddenError("You have a wrong couple ID and deleted this couple ID");
            } else if (couple.deleted) {
                throw new ForbiddenError("Couple is deleted");
            }

            const updateData: IUpdateWithService = {
                title: data.title,
                cupDay: data.cupDay,
                thumbnail: data.thumbnail
            };
            updatedCouple = await this.coupleService.update(transaction, couple, updateData, thumbnail);

            await transaction.commit();

            if (prevThumbnail && thumbnail) {
                await deleteFile(prevThumbnail);
                logger.debug(`Deleted Previous thumbnail => ${prevThumbnail}`);
            }

            return updatedCouple;
        } catch (error) {
            if (updatedCouple?.thumbnail) {
                deleteFile(updatedCouple.thumbnail);
                logger.error(`After updating the firebase, a db error occurred and the firebase thumbnail is deleted => ${updatedCouple.thumbnail}`);
            }
            if (transaction) await transaction.rollback();
            logger.error(`User update error => ${JSON.stringify(error)}`);

            throw error;
        }
    }

    async deleteCouple(userId: number, cupId: string): Promise<ITokenResponse> {
        const couple: Couple | null = await this.coupleService.select(cupId);
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

            const role: UserRole | null = await this.userRoleService.select(userId);
            if (!role) throw new UnauthorizedError("Invalid Role");

            const result: ITokenResponse = await jwt.createToken(userId, null, role.roleId);

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
