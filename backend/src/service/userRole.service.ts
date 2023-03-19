import { Transaction } from "sequelize";

import { Service } from "./service";

import { Role } from "../model/role.model";
import { UserRole } from "../model/userRole.model";

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
            },
            raw: true
        });

        return role;
    }

    async create(transaction: Transaction | null = null, userId: number): Promise<void> {
        await UserRole.create(
            {
                userId: userId,
                roleId: 4
            },
            { transaction }
        );
    }

    async update(transaction: Transaction, ...args: any[]): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async delete(transaction: Transaction, ...args: any[]): Promise<any> {
        throw new Error("Method not implemented.");
    }
}

export default UserRoleService;
