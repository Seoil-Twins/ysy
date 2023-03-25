import { Transaction } from "sequelize";
import { File } from "formidable";

import logger from "../logger/logger";

import sequelize from "../model";
import { User, ICreate, IUpdateWithController, IUserResponse, IUpdateWithService } from "../model/user.model";

import UserService from "../service/user.service";
import UserRoleService from "../service/userRole.service";

import NotFoundError from "../error/notFound";
import { deleteFile } from "../util/firebase";

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

    async createUser(data: ICreate): Promise<string> {
        const transaction: Transaction = await sequelize.transaction();

        try {
            const user: User = await this.userService.create(transaction, data);
            await this.userRoleService.create(transaction, user.userId, 4);
            await transaction.commit();

            const url: string = this.userService.getURL();
            return url;
        } catch (error) {
            await transaction.rollback();
            logger.error(`User create error => ${JSON.stringify(error)}`);

            throw error;
        }
    }

    async updateUser(data: IUpdateWithController, file?: File): Promise<User> {
        let updateUser: User | null = null;
        const transaction = await sequelize.transaction();

        try {
            const user: User | null = await this.userService.select({ userId: data.userId });
            if (!user) throw new NotFoundError("Not found user using token user ID");

            const prevProfile: string | null = user.profile;
            const updateData: IUpdateWithService = {
                cupId: data.cupId,
                name: data.name,
                primaryNofi: data.primaryNofi,
                dateNofi: data.dateNofi,
                eventNofi: data.eventNofi
            };

            updateUser = await this.userService.update(transaction, user, updateData, file);

            await transaction.commit();
            if (prevProfile && file) await deleteFile(prevProfile);

            return updateUser;
        } catch (error) {
            // Firebase에는 업로드 되었지만 DB 오류가 발생했다면 Firebase Profile 삭제
            if (updateUser?.profile) {
                await deleteFile(updateUser.profile);
                logger.error(`After updating the firebase, a db error occurred and the firebase profile is deleted => ${data.profile}`);
            }

            await transaction.rollback();
            logger.error(`User update error => UserId : ${data.userId} | ${JSON.stringify(error)}`);

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
