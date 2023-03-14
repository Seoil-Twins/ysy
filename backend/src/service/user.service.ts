import { Op, Transaction } from "sequelize";

import sequelize from "../model";
import { User, IUserResponse } from "../model/user.model";

import UnauthorizedError from "../error/unauthorized";

class UserService {
    getUser = async (userId: number): Promise<IUserResponse> => {
        const user1: User | null = await User.findOne({
            attributes: { exclude: ["password"] },
            where: { userId }
        });
        let user2: User | null = null;

        if (!user1) throw new UnauthorizedError("User not found with given ID");

        if (user1.cupId !== null) {
            user2 = await User.findOne({
                attributes: { exclude: ["password"] },
                where: {
                    cupId: user1.cupId,
                    [Op.not]: {
                        userId: user1.userId
                    }
                }
            });
        }

        const result: IUserResponse = {
            ...user1.dataValues,
            couple: user2
        };

        return result;
    };
}

export default UserService;
