import { Transaction } from "sequelize";
import { Role } from "../model/role.model";
import { UserRole } from "../model/userRole.model";

class UserRoleService {
    getUserRole = async (userId: number): Promise<UserRole | null> => {
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

    updateUserRole = async (transaction: Transaction, userId: number): Promise<void> => {
        await UserRole.create(
            {
                userId: userId,
                roleId: 4
            },
            { transaction }
        );
    };
}

export default UserRoleService;
