import { Transaction } from "sequelize";
import { File } from "formidable";

import logger from "../logger/logger";

import sequelize from "../model";
import { User, ICreate, IUpdateWithController, IUserResponse, IUpdateWithService } from "../model/user.model";

import UserService from "../service/user.service";
import UserRoleService from "../service/userRole.service";

import NotFoundError from "../error/notFound";

class UserController {
    private userService: UserService;
    private userRoleService: UserRoleService;

    constructor(userService: UserService, userRoleService: UserRoleService) {
        this.userService = userService;
        this.userRoleService = userRoleService;
    }

    async getUser(userId: number): Promise<IUserResponse> {
        const result: IUserResponse = await this.userService.selectForResponse(userId);

        return result;
    }

    async createUser(data: ICreate): Promise<void> {
        const transaction: Transaction = await sequelize.transaction();

        try {
            const user: User = await this.userService.create(transaction, data);
            await this.userRoleService.create(transaction, user.userId);
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            logger.error(`User create error => ${JSON.stringify(error)}`);

            throw error;
        }
    }

    async updateUser(data: IUpdateWithController, file?: File): Promise<User> {
        const transaction = await sequelize.transaction();

        try {
            const user: User | null = await this.userService.select({ userId: data.userId });
            if (!user) throw new NotFoundError("Not found user using token user ID");

            const updateData: IUpdateWithService = {
                cupId: data.cupId,
                name: data.name,
                profile: data.profile,
                primaryNofi: data.primaryNofi,
                dateNofi: data.dateNofi,
                eventNofi: data.eventNofi
            };
            const updateUser: User = await this.userService.update(transaction, user, updateData, file);
            await transaction.commit();

            return updateUser;
        } catch (error) {
            await transaction.rollback();
            logger.error(`User update error => ${JSON.stringify(error)}`);

            throw error;
        }
    }

    async deleteUser(userId: number): Promise<void> {
        const user: User | null = await this.userService.select({ userId });
        if (!user) throw new NotFoundError("Not found user using user ID");

        const transaction = await sequelize.transaction();

        try {
            await this.userService.delete(transaction, user);
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            logger.error(`User delete error => ${JSON.stringify(error)}`);

            throw error;
        }
    }
}

export default UserController;
