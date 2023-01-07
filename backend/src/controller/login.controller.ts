import { checkPassword } from "../util/password";
import { LoginModel } from "../model/login.model";

const controller = {
    login: async (data: JSON) => {
        const model: LoginModel = Object.assign(data);
        const isCheck: boolean = await checkPassword(model);

        console.log(isCheck);
    }
}

export default controller;
