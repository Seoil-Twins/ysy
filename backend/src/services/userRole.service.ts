import { Transaction } from "sequelize";

import { Service } from "./service";

import { Role } from "../models/role.model";
import { UserRole } from "../models/userRole.model";

class UserRoleService extends Service {
    getURL(...args: any[]): string {
        throw new Error("Method not implemented.");
    }

    async select(userId: number): Promise<UserRole | null> {
        const role: UserRole | null = await UserRole.findOne({
            where: { userId: userId },
            include: {
                model: Role,
                as: "role",
                attributes: { exclude: ["roleId"] }
            }
        });

        return role;
    }

    async create(transaction: Transaction | null = null, userId: number, roleId: number): Promise<void> {
        await UserRole.create(
            {
                userId,
                roleId
            },
            { transaction }
        );
    }

    async update(transaction: Transaction | null = null, userRole: UserRole, roleId: number): Promise<void> {
        await userRole.update(
            {
                roleId
            },
            { transaction }
        );
    }

    async delete(transaction: Transaction, ...args: any[]): Promise<any> {
        throw new Error("Method not implemented.");
    }
}

export default UserRoleService;
