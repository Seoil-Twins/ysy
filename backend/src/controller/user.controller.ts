import dayjs from "dayjs";
import randomString from "randomstring";
import { Op } from "sequelize";

import { User, ICreate, IRequestUpdate, IUserResponse } from "../model/user.model";

import { deleteFile, uploadFile } from "../util/firebase";
import { createDigest } from "../util/password";

import NotFoundError from "../error/notFound";
import ForbiddenError from "../error/forbidden";
import UnauthorizedError from "../error/unauthorized";

const folderName = "profiles";

const controller = {
    getUser: async (userId: number): Promise<IUserResponse> => {
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
    createUser: async (data: ICreate): Promise<void> => {
        let isNot = true;
        let code = "";

        // 중복된 code가 있는지 검사
        while (isNot) {
            code = randomString.generate({
                length: 6,
                charset: "alphanumeric"
            });

            const user: User | null = await User.findOne({
                where: {
                    code: code
                }
            });

            if (!user) isNot = false;
        }

        const hash: string = await createDigest(data.password);
        data.code = code;
        data.password = hash;

        await User.create({
            snsId: data.snsId,
            code: code,
            name: data.name,
            email: data.email,
            birthday: new Date(data.birthday),
            password: hash,
            phone: data.phone,
            eventNofi: data.eventNofi
        });
    },
    updateUser: async (data: IRequestUpdate): Promise<void> => {
        let isUpload = false;
        let fileName: string | null = "";

        const user: User | null = await User.findOne({
            where: {
                userId: data.userId
            }
        });

        if (!user) throw new NotFoundError("Not Found User");
        else if (user.deleted) throw new ForbiddenError("Forbidden Error");

        const updateData: any = {
            userId: data.userId
        };

        if (data.name) updateData.name = data.name;
        if (data.primaryNofi !== undefined) updateData.primaryNofi = data.primaryNofi;
        if (data.dateNofi !== undefined) updateData.dateNofi = data.dateNofi;
        if (data.eventNofi !== undefined) updateData.eventNofi = data.eventNofi;

        let prevProfile: string | null = user.profile;

        try {
            if (data.profile) {
                const reqFileName = data.profile.originalFilename;

                /**
                 * Frontend에선 static으로 default.jpg,png,svg 셋 중 하나 갖고있다가
                 * 사용자가 profile을 내리면 그걸로 넣고 요청
                 */
                if (reqFileName === "default.jpg" || reqFileName === "default.png" || reqFileName === "default.svg") {
                    fileName = null;
                } else {
                    fileName = `${data.userId}.${dayjs().valueOf()}.${data.profile.originalFilename!}`;

                    await uploadFile(fileName, folderName, data.profile.filepath);
                    isUpload = true;
                }

                updateData.profile = fileName;
            }

            await user.update(updateData);

            // 이미 profile이 있다면 Firebase에서 삭제
            if (prevProfile && data.profile) await deleteFile(prevProfile, folderName);
        } catch (error) {
            // Firebase에는 업로드 되었지만 DB 오류가 발생했다면 Firebase Profile 삭제
            if (data.profile && isUpload) await deleteFile(fileName!, folderName);

            throw error;
        }
    },
    /**
     * 사용자 정보 삭제이며, Couple이 있는 경우 Frontend에서 연인 끊기 후 삭제를 요청.
     * @param userId User Id
     * @param cupId Couple Id
     */
    deleteUser: async (userId: number): Promise<void> => {
        const user: User | null = await User.findOne({ where: { userId: userId } });

        if (!user) throw new NotFoundError("Not Found User");

        await user.update({
            deleted: true,
            deletedTime: new Date(dayjs().valueOf())
        });

        if (user.profile) await deleteFile(user.profile, folderName);
    }
};

export default controller;
