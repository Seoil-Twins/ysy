import randomString from "randomstring";
import dayjs from "dayjs";
import { Op } from "sequelize";

import BadRequestError from "../error/badRequest";
import ConflictError from "../error/conflict";

import sequelize from "../model";
import { User } from "../model/user.model";
import { Couple, IRequestCreateData, ICoupleResponse, IRequestUpdateData } from "../model/couple.model";

import { deleteFile, uploadFile } from "../util/firebase";
import NotFoundError from "../error/notFound";
import UnauthorizedError from "../error/unauthorized";
import ForbiddenError from "../error/forbidden";
import InternalServerError from "../error/internalServer";

const folderName = "couples";

const controller = {
    getCouple: async (userId: number) => {
        const user1 = await User.findOne({
            attributes: { exclude: ["password", "primaryNofi", "dateNofi", "eventNofi", "createdTime", "deleted", "deletedTime"] },
            where: { userId: userId }
        });

        if (!user1 || !user1.cupId) throw new NotFoundError("Not Found Couple");

        const couple = await Couple.findOne({
            where: { cupId: user1.cupId }
        });

        const user2 = await User.findOne({
            attributes: { exclude: ["password", "primaryNofi", "dateNofi", "eventNofi", "createdTime", "deleted", "deletedTime"] },
            where: {
                cupId: couple!.cupId,
                [Op.not]: {
                    userId: userId
                }
            }
        });

        const response: ICoupleResponse = {
            user1: user1,
            user2: user2!,
            couple: couple!
        };

        return response;
    },
    createCouple: async (data: IRequestCreateData): Promise<void> => {
        let fileName = null;
        let isUpload = false;

        const t = await sequelize.transaction();

        try {
            let isNot = true;
            let cupId = "";

            if (data.thumbnail) {
                fileName = `${dayjs().valueOf()}.${data.thumbnail.originalFilename!}`;

                await uploadFile(fileName, folderName, data.thumbnail.filepath);
                isUpload = true;
            }

            // 중복된 Id인지 검사
            while (isNot) {
                cupId = randomString.generate({
                    length: 8,
                    charset: "alphanumeric"
                });

                const user: User | null = await User.findOne({
                    where: { cupId: cupId }
                });

                if (!user) isNot = false;
            }

            await Couple.create(
                {
                    cupId: cupId,
                    cupDay: data.cupDay,
                    title: data.title,
                    thumbnail: fileName
                },
                { transaction: t }
            );

            const user1: User | null = await User.findOne({
                where: { userId: data.userId }
            });

            const user2: User | null = await User.findOne({
                where: { userId: data.userId2 }
            });

            if (!user1 || !user2) throw new BadRequestError("Bad Request");
            else if (user1.cupId || user2.cupId) throw new ConflictError("Duplicated Cup Id");

            await user1.update(
                { cupId: cupId },
                {
                    where: { userId: data.userId },
                    transaction: t
                }
            );

            await user2.update(
                { cupId: cupId },
                {
                    where: { userId: data.userId2 },
                    transaction: t
                }
            );

            await t.commit();
        } catch (error) {
            await t.rollback();

            // Firebase에는 업로드 되었지만 DB 오류가 발생했다면 Firebase Profile 삭제
            if (data.thumbnail && isUpload) await deleteFile(fileName!, folderName);

            throw error;
        }
    },
    updateCouple: async (data: IRequestUpdateData) => {
        let isUpload = false;
        let fileName: string | null = null;
        const user = await User.findOne({
            attributes: ["cupId"],
            where: { userId: data.userId }
        });

        if (!user) throw new UnauthorizedError("Invalid Token (User not found using token)");
        else if (user.cupId !== data.cupId) throw new ForbiddenError("Forbidden Error");

        const couple = await Couple.findOne({
            where: { cupId: data.cupId }
        });

        // User Table에는 있지만 Couple Table에 없다면
        if (!couple) {
            await user.update({
                cupId: null
            });

            throw new InternalServerError("DB Error");
        }

        let updateData: any = { cupId: data.cupId };

        if (data.title) updateData.title = data.title;
        if (data.cupDay) updateData.cupDay = data.cupDay;

        let prevThumbnail: string | null = couple.thumbnail;

        try {
            if (data.thumbnail) {
                const reqFileName = data.thumbnail.originalFilename;

                if (reqFileName === "default.jpg" || reqFileName === "default.png" || reqFileName === "default.svg") {
                    fileName = null;
                } else {
                    fileName = `${data.cupId}.${dayjs().valueOf()}.${data.thumbnail.originalFilename!}`;

                    await uploadFile(fileName, folderName, data.thumbnail.filepath);
                    isUpload = true;
                }

                updateData.thumbnail = fileName;
            }

            await couple.update(updateData);

            // Upload, DB Update를 하고나서 기존 이미지 지우기
            if (prevThumbnail) await deleteFile(prevThumbnail, folderName);
        } catch (error) {
            // Firebase에는 업로드 되었지만 DB 오류가 발생했다면 Firebase Profile 삭제
            if (data.thumbnail && isUpload) await deleteFile(fileName!, folderName);

            throw error;
        }
    }
};

export default controller;
