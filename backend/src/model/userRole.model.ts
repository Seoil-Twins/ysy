import { DataTypes, Model, NonAttribute } from "sequelize";

import sequelize from ".";
import { Role } from "./role.model";
import { User } from "./user.model";

// -------------------------------------------- Interface ------------------------------------------ //
export interface IUserRole {
    userRoleId: number;
    userId: number;
    roleId: number;
}

interface ICreate {
    userId: number;
    roleId: number;
}
// ------------------------------------------ Interface End ---------------------------------------- //

export class UserRole extends Model<IUserRole, ICreate> {
    declare role: NonAttribute<Role>;

    declare userId: number;
    declare roleId: number;
}

UserRole.init(
    {
        userRoleId: {
            field: "user_role_id",
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true
        },
        userId: {
            field: "user_id",
            type: DataTypes.INTEGER.UNSIGNED,
            unique: true,
            allowNull: false,
            references: {
                model: User,
                key: "userId"
            }
        },
        roleId: {
            field: "role_id",
            type: DataTypes.SMALLINT,
            allowNull: false,
            references: {
                model: Role,
                key: "roleId"
            }
        }
    },
    {
        sequelize: sequelize,
        tableName: "user_role",
        timestamps: false
    }
);
