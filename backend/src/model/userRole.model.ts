import { DataTypes, Model, NonAttribute } from "sequelize";

import sequelize from ".";
import { Role } from "./role.model";
import { User } from "./user.model";

// -------------------------------------------- Interface ------------------------------------------ //
export interface IUserRole {
    userId: number;
    roleId: number;
}
// ------------------------------------------ Interface End ---------------------------------------- //

export class UserRole extends Model<IUserRole> {
    declare role: NonAttribute<Role>;

    declare userId: number;
    declare roleId: number;
}

UserRole.init(
    {
        userId: {
            field: "user_id",
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            references: {
                model: User,
                key: "userId"
            }
        },
        roleId: {
            field: "role_id",
            type: DataTypes.SMALLINT,
            primaryKey: true,
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
