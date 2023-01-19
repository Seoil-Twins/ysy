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
import { ITokenResponse } from "../model/auth.model";
import jwt from "../util/jwt";

const folderName = "couples";

const controller = {
    getCouple: async (userId: number, cupId: string): Promise<ICoupleResponse> => {
        const excludeColumns = ["password", "primaryNofi", "dateNofi", "eventNofi", "createdTime", "deleted", "deletedTime"];

        const couple = await Couple.findOne({
            where: { cupId: cupId }
        });

        const user1 = await User.findOne({
            attributes: { exclude: excludeColumns },
            where: { userId: userId }
        });

        const user2 = await User.findOne({
            attributes: { exclude: excludeColumns },
            where: {
                cupId: cupId,
                [Op.not]: {
                    userId: user1!.userId
                }
            }
        });

        if (!user1 || !user2 || !couple) throw new NotFoundError("Not Found Couple");

        const response: ICoupleResponse = {
            user1: user1,
            user2: user2!,
            couple: couple!
        };

        return response;
    },
    createCouple: async (data: IRequestCreateData): Promise<ITokenResponse> => {
        let fileName = null;
        let isUpload = false;

        const t = await sequelize.transaction();

        try {
            let isNot = true;
            let cupId = "";

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

            if (data.thumbnail) {
                fileName = `${cupId}.${dayjs().valueOf()}.${data.thumbnail.originalFilename!}`;

                await uploadFile(fileName, folderName, data.thumbnail.filepath);
                isUpload = true;
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

            // token 재발급
            const result: ITokenResponse = await jwt.createToken(data.userId, cupId);

            return result;
        } catch (error) {
            await t.rollback();

            // Firebase에는 업로드 되었지만 DB 오류가 발생했다면 Firebase Profile 삭제
            if (data.thumbnail && isUpload) await deleteFile(fileName!, folderName);

            throw error;
        }
    },
    updateCouple: async (data: IRequestUpdateData): Promise<void> => {
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
        } else if (couple.deleted) {
            throw new ForbiddenError("Forbidden Error");
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
    },
    deleteCouple: async (userId: number, cupId: string): Promise<ITokenResponse> => {
        const couple = await Couple.findOne({
            where: { cupId: cupId }
        });

        const user1 = await User.findOne({
            where: { userId: userId }
        });

        const user2 = await User.findOne({
            where: {
                cupId: cupId,
                [Op.not]: {
                    userId: user1!.userId
                }
            }
        });

        if (!user1 || !user2 || !couple) throw new NotFoundError("Not Found");

        const t = await sequelize.transaction();

        try {
            const currentTime = new Date(dayjs().valueOf());

            await user1.update({ cupId: null }, { transaction: t });
            await user2.update({ cupId: null }, { transaction: t });
            await couple.update(
                {
                    deleted: true,
                    deletedTime: currentTime
                },
                { transaction: t }
            );

            const result: ITokenResponse = await jwt.createToken(userId, null);

            t.commit();

            if (couple.thumbnail) await deleteFile(couple.thumbnail, folderName);

            return result;
        } catch (error) {
            t.rollback();

            throw error;
        }
    }
};

export default controller;
