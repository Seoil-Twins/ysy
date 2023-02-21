import { DataTypes, Model } from "sequelize";

import sequelize from ".";

// -------------------------------------------- Interface ------------------------------------------ //
export interface IRole {
    roleId: number;
    name: string;
}
// ------------------------------------------ Interface End ---------------------------------------- //

export class Role extends Model<IRole> {
    declare roleId: number;
    declare name: string;
}

Role.init(
    {
        roleId: {
            field: "role_id",
            type: DataTypes.SMALLINT,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(10),
            allowNull: false
        }
    },
    {
        sequelize: sequelize,
        tableName: "role",
        timestamps: false
    }
);
