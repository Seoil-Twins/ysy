import { RowDataPacket } from "mysql2";

import { USER_TABLE_NAME, UserColumn } from "../model/user.model";
import { LoginModel } from "../model/auth.model";
import { select, OptionType } from "../util/sql";
import { checkPassword } from "../util/password";
import UnauthorizedError from "../error/unauthorized";

const controller = {
    login: async (data: JSON) => {
        const model: LoginModel = Object.assign(data);
        const options: OptionType = {
            table: USER_TABLE_NAME,
            column: [UserColumn.password],
            limit: 1,
            where: `${UserColumn.email} = "${model.email}"`
        };

        const response: RowDataPacket[] = await select(options);

        if (response.length <= 0) {
            throw new UnauthorizedError("Invalid Email");
        }

        const password: string = response[0].password;
        const isCheck: boolean = await checkPassword(model.password, password);

        if (!isCheck) throw new UnauthorizedError("Invalid Password");

        console.log(isCheck);
    }
};

export default controller;
