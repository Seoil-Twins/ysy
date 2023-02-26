import dayjs from "dayjs";
import randomString from "randomstring";
import { Op } from "sequelize";
import { File } from "formidable";

import logger from "../logger/logger";
import { deleteFile, isDefaultFile, uploadFile } from "../util/firebase";
import { createDigest } from "../util/password";

import sequelize from "../model";
import { User, ICreate, IUpdate, IUserResponse } from "../model/user.model";
import { UserRole } from "../model/userRole.model";

import NotFoundError from "../error/notFound";
import ForbiddenError from "../error/forbidden";
import UnauthorizedError from "../error/unauthorized";
import ConflictError from "../error/conflict";

const FOLDER_NAME = "users";

const createCode = async (): Promise<string> => {
    let isNot = true;
    let code = "";

    while (isNot) {
        code = randomString.generate({
            length: 6,
            charset: "alphanumeric"
        });

        const user: User | null = await User.findOne({
            where: { code }
        });

        if (!user) isNot = false;
    }

    return code;
};

const uploadProfile = async (userId: number, file: File) => {
    let path: string | null = "";
    const reqFileName = file.originalFilename!;
    const isDefault = isDefaultFile(reqFileName);

    /**
     * Frontend에선 static으로 default.jpg,png,svg 셋 중 하나 갖고있다가
     * 사용자가 profile을 내리면 그걸로 넣고 요청
     */
    if (isDefault) {
        path = null;
    } else {
        path = `${FOLDER_NAME}/${userId}/profile/${dayjs().valueOf()}.${reqFileName}`;
        await uploadFile(path, file.filepath);
    }

    return path;
};

const controller = {
    /**
     * 유저와 커플의 정보를 가져옵니다.
     * @param userId User Id
     * @returns A {@link IUserResponse}
     */
    getUsers: async (userId: number): Promise<IUserResponse> => {
        const user1: User | null = await User.findOne({
            attributes: { exclude: ["password"] },
            where: {
                userId: userId
            }
        });
        let user2: User | null = null;

        if (!user1) throw new UnauthorizedError("Invalid Token (User not found using token)");

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
            couple: user2
        };

        return result;
    },
    /**
     * 유저 정보를 생성합니다.
     * @param data A {@link ICreate}
     */
    createUser: async (data: ICreate): Promise<void> => {
        const user: User | null = await User.findOne({
            where: {
                [Op.or]: [{ email: data.email }, { phone: data.phone }]
            }
        });

        if (user) throw new ConflictError("Duplicated User");

        const transaction = await sequelize.transaction();
        const hash: string = await createDigest(data.password);
        data.password = hash;
        data.code = await createCode();

        try {
            const createdUser: User = await User.create(
                {
                    snsId: data.snsId,
                    code: data.code,
                    name: data.name,
                    email: data.email,
                    birthday: new Date(data.birthday),
                    password: hash,
                    phone: data.phone,
                    eventNofi: data.eventNofi
                },
                { transaction }
            );

            await UserRole.create(
                {
                    userId: createdUser.userId,
                    roleId: 4
                },
                { transaction }
            );

            transaction.commit();
        } catch (error) {
            transaction.rollback();
            throw error;
        }

        logger.debug(`Created User => ${data.email}`);
    },
    /**
     * 유저의 정보를 수정합니다.
     * @param data A {@link IUpdate}
     * @param profile User Profile
     */
    updateUser: async (data: IUpdate, file?: File): Promise<void> => {
        let isUpload = false;
        let path: string | null = "";

        const user: User | null = await User.findOne({
            where: { userId: data.userId }
        });

        if (!user) throw new NotFoundError("Not Found User");
        else if (user.deleted) throw new ForbiddenError("Forbidden Error");

        let prevProfile: string | null = user.profile;

        try {
            if (file) {
                data.profile = await uploadProfile(data.userId, file);
                if (data.profile) isUpload = true;
                else if (prevProfile && !data.profile) await deleteFile(prevProfile);
            }

            await user.update(data);
            logger.debug(`Update Data => ${JSON.stringify(data)}`);

            // 이미 profile이 있다면 Firebase에서 삭제
            if (prevProfile && data.profile) {
                await deleteFile(prevProfile);
                logger.debug(`Deleted already profile => ${prevProfile}`);
            }
        } catch (error) {
            // Firebase에는 업로드 되었지만 DB 오류가 발생했다면 Firebase Profile 삭제
            if (data.profile && isUpload) {
                await deleteFile(path!);
                logger.error(`After updating the firebase, a db error occurred and the firebase profile is deleted => ${path}`);
            }

            throw error;
        }
    },
    /**
     * 사용자 정보 삭제이며, Couple이 있는 경우 Frontend에서 연인 끊기 후 삭제를 요청.
     * @param userId User Id
     */
    deleteUser: async (userId: number): Promise<void> => {
        const user: User | null = await User.findOne({ where: { userId: userId } });

        if (!user) throw new NotFoundError("Not Found User");

        await user.update({
            deleted: true,
            deletedTime: new Date(dayjs().valueOf())
        });

        if (user.profile) await deleteFile(user.profile);
        logger.debug(`Success Deleted userId => ${userId}`);
    }
};

export default controller;
