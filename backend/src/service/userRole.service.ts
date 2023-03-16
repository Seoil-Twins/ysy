import { Transaction } from "sequelize";

import { Service } from "./service";

import { Role } from "../model/role.model";
import { UserRole } from "../model/userRole.model";

class UserRoleService extends Service {
    select = async (userId: number): Promise<UserRole | null> => {
        const role: UserRole | null = await UserRole.findOne({
            where: { userId: userId },
            include: {
                model: Role,
                as: "role",
                attributes: { exclude: ["roleId"] }
            },
            raw: true
        });

        return role;
    };

    create = async (transaction: Transaction, userId: number): Promise<any> => {
        await UserRole.create(
            {
                userId: userId,
                roleId: 4
            },
            { transaction }
        );
    };

    update = async (transaction: Transaction, ...args: any[]): Promise<void> => {
        throw new Error("Method not implemented.");
    };

    delete(transaction: Transaction, ...args: any[]): Promise<any> {
        throw new Error("Method not implemented.");
    }
}

export default UserRoleService;
