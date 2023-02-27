import { DataTypes, Model } from "sequelize";
import { InferAttributes, InferCreationAttributes } from "sequelize/types/model";

import sequelize from ".";

export class Role extends Model<InferAttributes<Role>, InferCreationAttributes<Role>> {
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
