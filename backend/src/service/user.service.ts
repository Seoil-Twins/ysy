import dayjs from "dayjs";
import { File } from "formidable";
import randomString from "randomstring";
import { Op, Transaction, WhereOptions } from "sequelize";

import { API_ROOT } from "..";

import { Service } from "./service";

import logger from "../logger/logger";
import { User, IUserResponse, ICreate, IUpdateWithService } from "../model/user.model";
import { Couple } from "../model/couple.model";

import UnauthorizedError from "../error/unauthorized";
import ConflictError from "../error/conflict";

import { deleteFile, uploadFile } from "../util/firebase";
import { createDigest } from "../util/password";

import NotFoundError from "../error/notFound";
import ForbiddenError from "../error/forbidden";

class UserService extends Service {
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

        let isUpload = false;
        let prevProfile: string | null = user.profile;

        try {
            const updatedUser: User = await user.update(data, { transaction });

            if (file) {
                // profile 있으면 업로드
                if (data.profile) {
                    await uploadFile(data.profile, file.filepath);
                    isUpload = true;

                    if (prevProfile) await deleteFile(prevProfile); // 전에 있던 profile 삭제
                } else if (prevProfile && !data.profile) {
                    // default 이미지로 변경시
                    await deleteFile(prevProfile);
                }
            }

            return updatedUser;
        } catch (error) {
            // Firebase에는 업로드 되었지만 DB 오류가 발생했다면 Firebase Profile 삭제
            if (data.profile && isUpload) {
                await deleteFile(data.profile);
                logger.error(`After updating the firebase, a db error occurred and the firebase profile is deleted => ${data.profile}`);
            }

            throw error;
        }
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
