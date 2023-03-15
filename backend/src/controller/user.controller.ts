import { Transaction } from "sequelize";
import { File } from "formidable";

import logger from "../logger/logger";

import sequelize from "../model";
import { User, ICreate, IUpdate, IUserResponse } from "../model/user.model";

import UserService from "../service/user.service";

class UserController {
    private userService: UserService;

    constructor(userService: UserService) {
        this.userService = userService;
    }

    getUser = async (userId: number): Promise<IUserResponse> => {
        const result: IUserResponse = await this.userService.getUser(userId);

        return result;
    };

    createUser = async (data: ICreate): Promise<void> => {
        const transaction: Transaction = await sequelize.transaction();

        try {
            await this.userService.createUser(transaction, data);
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
            const updateUser: User = await this.userService.updateUser(transaction, data, file);
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
            await this.userService.deleteUser(transaction, userId);
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            logger.error(`User delete error => ${JSON.stringify(error)}`);

            throw error;
        }
    };
}

export default UserController;
