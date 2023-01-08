import { RowDataPacket } from "mysql2";

import { USER_TABLE_NAME, UserColumn, UserModel, rowDataToModel } from "../model/user.model";
import { LoginModel } from "../model/auth.model";
import { select, OptionType } from "../util/sql";
import { checkPassword } from "../util/password";
import jwt from "../util/jwt";
import { set, get } from "../util/redis";
import UnauthorizedError from "../error/unauthorized";

interface ResponseModel {
    accessToken: string;
    refreshToken?: string;
}

const controller = {
    login: async (data: JSON) => {
        const loginRequest: LoginModel = Object.assign(data);
        const options: OptionType = {
            table: USER_TABLE_NAME,
            where: `${UserColumn.email} = "${loginRequest.email}"`
        };

        const response: RowDataPacket[] = await select(options);

        if (response.length <= 0) throw new UnauthorizedError("Invalid Email");

        const user: Array<UserModel> = rowDataToModel(response);
        const isCheck: boolean = await checkPassword(loginRequest.password, user[0].password);

        if (!isCheck) throw new UnauthorizedError("Invalid Password");

        const accessToken: string = jwt.createAccessToken(user[0]);
        const refreshToken: string = jwt.createRefreshToken();

        // redis database에 refreshToken 저장
        const isOk = await set(String(user[0].userId), refreshToken);
        const result: ResponseModel = {
            accessToken: accessToken
        };

        if (isOk == "OK") result.refreshToken = refreshToken;
        else result.refreshToken = "";

        return result;
    }
};

export default controller;
