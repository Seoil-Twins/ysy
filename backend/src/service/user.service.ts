import dayjs from "dayjs";
import { File } from "formidable";
import randomString from "randomstring";
import { Op, Transaction, WhereOptions } from "sequelize";

import { API_ROOT } from "..";

import { Service } from "./service";

import logger from "../logger/logger";
import { User, IUserResponse, ICreate, IUpdateWithService } from "../model/user.model";
import { Couple } from "../model/couple.model";

import UnauthorizedError from "../error/unauthorized.error";
import ConflictError from "../error/conflict.error";

import { isDefaultFile, uploadFile } from "../util/firebase.util";
import { createDigest } from "../util/password.util";

import NotFoundError from "../error/notFound.error";
import ForbiddenError from "../error/forbidden.error";

class UserService extends Service {
    private FOLDER_NAME = "users";

    createProfile(userId: number, file: File): string | null {
        let path: string | null = "";
        const reqFileName = file.originalFilename!;
        const isDefault = isDefaultFile(reqFileName);

        /**
         * Frontend에선 static으로 default.jpg,png,svg 셋 중 하나 갖고있다가
         * 사용자가 profile을 내리면 그걸로 넣고 요청
         */
        if (isDefault) path = null;
        else path = `${this.FOLDER_NAME}/${userId}/profile/${dayjs().valueOf()}.${reqFileName}`;

        return path;
    }

    async createCode(): Promise<string> {
        let isNot = true;
        let code = "";

        while (isNot) {
            code = randomString.generate({
                length: 6,
                charset: "alphanumeric"
            });

            const user: User | null = await this.select({ code });
            if (!user) isNot = false;
        }

        return code;
    }

    getURL(): string {
        return `${API_ROOT}/user/me`;
    }

    async select(where: WhereOptions<User>): Promise<User | null> {
        const user: User | null = await User.findOne({ where });
        return user;
    }

    async selectForResponse(userId: number): Promise<IUserResponse> {
        const user1: User | null = await User.findOne({
            attributes: { exclude: ["password"] },
            where: { userId }
        });

        let user2: User | null = null;

        if (!user1) throw new UnauthorizedError("User not found with given ID");

        if (user1.cupId !== null) {
            user2 = await User.findOne({
                attributes: { exclude: ["password"] },
                where: {
                    cupId: user1.cupId,
                    [Op.not]: {
                        userId: user1.userId
                    }
                }
            });
        }

        const result: IUserResponse = {
            ...user1.dataValues,
            couple: user2 ? user2 : undefined
        };

        return result;
    }

    async selectWithCouple(couple: Couple): Promise<User[]> {
        const users: User[] = await couple.getUsers();
        return users;
    }

    async create(transaction: Transaction | null = null, data: ICreate): Promise<User> {
        const user: User | null = await this.select({ email: data.email, phone: data.phone });
        if (user) throw new ConflictError("Duplicated User");

        const hash: string = await createDigest(data.password);
        const code = await this.createCode();

        const createdUser: User = await User.create(
            {
                snsId: data.snsId,
                code: code,
                name: data.name,
                email: data.email,
                birthday: new Date(data.birthday),
                password: hash,
                phone: data.phone,
                eventNofi: data.eventNofi
            },
            { transaction }
        );

        return createdUser;
    }

    async update(transaction: Transaction | null = null, user: User, data: IUpdateWithService, file?: File): Promise<User> {
        if (user.deleted) throw new ForbiddenError("User is deleted");

        if (file) data.profile = this.createProfile(user.userId, file);
        const updatedUser: User = await user.update(data, { transaction });

        if (file && data.profile) await uploadFile(data.profile, file.filepath);
        return updatedUser;
    }

    async delete(transaction: Transaction | null = null, user: User): Promise<void> {
        if (!user) throw new NotFoundError("Not Found User");

        await user.update(
            {
                deleted: true,
                deletedTime: new Date(dayjs().valueOf())
            },
            { transaction }
        );

        logger.debug(`Success Deleted userId => ${user.userId}`);
    }
}

export default UserService;
