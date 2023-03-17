import randomString from "randomstring";
import { Transaction } from "sequelize";
import { File } from "formidable";

import sequelize from "../model";
import { User } from "../model/user.model";
import { ITokenResponse } from "../model/auth.model";
import { Couple, IRequestCreate, IUpdateWithController, IUpdateWithService } from "../model/couple.model";

import NotFoundError from "../error/notFound";
import UnauthorizedError from "../error/unauthorized";
import ForbiddenError from "../error/forbidden";
import InternalServerError from "../error/internalServer";
import BadRequestError from "../error/badRequest";
import ConflictError from "../error/conflict";

import logger from "../logger/logger";
import jwt from "../util/jwt";
import { UserRole } from "../model/userRole.model";

import UserService from "../service/user.service";
import UserRoleService from "../service/userRole.service";
import CoupleService from "../service/couple.service";

class CoupleController {
    private coupleSerivce: CoupleService;
    private userService: UserService;
    private userRoleService: UserRoleService;

    constructor(coupleSerivce: CoupleService, userService: UserService, userRoleService: UserRoleService) {
        this.coupleSerivce = coupleSerivce;
        this.userService = userService;
        this.userRoleService = userRoleService;
    }

    async getCouple(cupId: string): Promise<Couple> {
        const couple: Couple | null = await this.coupleSerivce.select(cupId, ["password"]);
        if (!couple) throw new NotFoundError("Not Found Couple");

        return couple;
    }

    async createCouple(data: IRequestCreate, file?: File): Promise<ITokenResponse> {
        let isNot = true;
        let cupId = "";
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

            const createdCouple = await this.coupleSerivce.create(transaction, cupId, data, file);
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

            return result;
        } catch (error) {
            if (transaction) await transaction.rollback();
            logger.error(`Couple create Error => ${JSON.stringify(error)}`);

            throw error;
        }
    }

    async updateCouple(data: IUpdateWithController, thumbnail?: File): Promise<Couple> {
        let transaction: Transaction | undefined = undefined;
        const user: User | null = await this.userService.select({ userId: data.userId });

        if (!user) throw new UnauthorizedError("Invalid Token (User not found using token)");
        else if (user.cupId !== data.cupId) throw new ForbiddenError("You don't same user couple ID and path parameter couple ID");

        try {
            transaction = await sequelize.transaction();

            const couple: Couple | null = await this.coupleSerivce.select(data.cupId);

            if (!couple) {
                await this.userService.update(transaction, user, {
                    cupId: null
                });

                throw new InternalServerError("DB Error");
            } else if (couple.deleted) {
                throw new ForbiddenError("Couple is deleted");
            }

            const updateData: IUpdateWithService = {
                title: data.title,
                cupDay: data.cupDay,
                thumbnail: data.thumbnail
            };
            const updatedCouple: Couple = await this.coupleSerivce.update(transaction, couple, updateData, thumbnail);

            await transaction.commit();
            return updatedCouple;
        } catch (error) {
            if (transaction) await transaction.rollback();
            logger.error(`User update error => ${JSON.stringify(error)}`);

            throw error;
        }
    }

    async deleteCouple(userId: number, cupId: string): Promise<ITokenResponse> {
        const couple: Couple | null = await this.coupleSerivce.select(cupId);
        if (!couple) throw new NotFoundError("Not found couple using token couple ID");
        else if (!couple.users) throw new NotFoundError("Not found user or another user using token couple ID");

        const user1: User = couple.users[0].userId === userId ? couple.users[0] : couple.users[1];
        const user2: User = couple.users[0].userId !== userId ? couple.users[0] : couple.users[1];

        let transaction: Transaction | undefined = undefined;

        try {
            transaction = await sequelize.transaction();

            await this.userService.update(transaction, user1, { cupId: null });
            await this.userService.update(transaction, user2, { cupId: null });
            await this.coupleSerivce.delete(transaction, couple);

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
