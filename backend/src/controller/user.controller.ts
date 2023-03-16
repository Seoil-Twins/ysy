import { Transaction } from "sequelize";
import { File } from "formidable";

import logger from "../logger/logger";

import sequelize from "../model";
import { User, ICreate, IUpdate, IUserResponse } from "../model/user.model";

import UserService from "../service/user.service";
import UserRoleService from "../service/userRole.service";

class UserController {
    private userService: UserService;
    private userRoleService: UserRoleService;

    constructor(userService: UserService, userRoleService: UserRoleService) {
        this.userService = userService;
        this.userRoleService = userRoleService;
    }

    getUser = async (userId: number): Promise<IUserResponse> => {
        const result: IUserResponse = await this.userService.select(userId);

        return result;
    };

    createUser = async (data: ICreate): Promise<void> => {
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
    };

    updateUser = async (data: IUpdate, file?: File): Promise<User> => {
        const transaction = await sequelize.transaction();

        try {
            const updateUser: User = await this.userService.update(transaction, data, file);
            await transaction.commit();

            return updateUser;
        } catch (error) {
            await transaction.rollback();
            logger.error(`User update error => ${JSON.stringify(error)}`);

            throw error;
        }
    };

    deleteUser = async (userId: number): Promise<void> => {
        const transaction = await sequelize.transaction();

        try {
            await this.userService.delete(transaction, userId);
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            logger.error(`User delete error => ${JSON.stringify(error)}`);

            throw error;
        }
    };
}

export default UserController;
