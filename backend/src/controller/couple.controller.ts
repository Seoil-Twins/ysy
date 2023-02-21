import randomString from "randomstring";
import dayjs from "dayjs";
import { Op } from "sequelize";
import { File } from "formidable";

import sequelize from "../model";
import { User } from "../model/user.model";
import { ITokenResponse } from "../model/auth.model";
import { Couple, IRequestCreate, IUpdate } from "../model/couple.model";

import NotFoundError from "../error/notFound";
import UnauthorizedError from "../error/unauthorized";
import ForbiddenError from "../error/forbidden";
import InternalServerError from "../error/internalServer";
import BadRequestError from "../error/badRequest";
import ConflictError from "../error/conflict";

import logger from "../logger/logger";
import jwt from "../util/jwt";
import { deleteFile, uploadFile, isDefaultFile } from "../util/firebase";
import { UserRole } from "../model/userRole.model";
import { Role } from "../model/role.model";

const folderName = "couples";

const controller = {
    /**
     * 커플 정보를 가져옵니다.
     * @param cupId Couple Id
     * @returns A {@link Couple}
     */
    getCouple: async (cupId: string): Promise<Couple> => {
        const couple: Couple | null = await Couple.findOne({
            where: { cupId: cupId },
            include: {
                model: User,
                as: "users",
                attributes: { exclude: ["password"] }
            }
        });

        if (!couple) throw new NotFoundError("Not Found Couple");

        return couple;
    },
    /**
     * 커플를 생성하고 업데이트된 토큰 정보를 반환합니다.
     * @param data A {@link IRequestCreate}
     * @returns A {@link ITokenResponse}
     */
    createCouple: async (data: IRequestCreate): Promise<ITokenResponse> => {
        let path = null;
        let isUpload = false;

        const transaction = await sequelize.transaction();

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
                path = `${folderName}/${cupId}/thumbnail/${dayjs().valueOf()}.${data.thumbnail.originalFilename!}`;

                await uploadFile(path, data.thumbnail.filepath);
                isUpload = true;
            }

            await Couple.create(
                {
                    cupId: cupId,
                    cupDay: data.cupDay,
                    title: data.title,
                    thumbnail: path
                },
                { transaction }
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
                    transaction: transaction
                }
            );

            await user2.update(
                { cupId: cupId },
                {
                    where: { userId: data.userId2 },
                    transaction: transaction
                }
            );

            const role: UserRole | null = await UserRole.findOne({
                where: { userId: user1.userId },
                include: {
                    model: Role,
                    as: "role"
                }
            });

            if (!role) throw new UnauthorizedError("Invalid Role");

            await transaction.commit();
            logger.debug(`Create Data => ${JSON.stringify(data)}`);

            // token 재발급
            const result: ITokenResponse = await jwt.createToken(data.userId, cupId, role.roleId);

            return result;
        } catch (error) {
            await transaction.rollback();

            // Firebase에는 업로드 되었지만 DB 오류가 발생했다면 Firebase thumbnail 삭제
            if (data.thumbnail && isUpload) {
                await deleteFile(path!);
                logger.error(`After updating the firebase, a db error occurred and the firebase thumbnail is deleted => ${path}`);
            }

            throw error;
        }
    },
    /**
     * 커플 정보를 수정합니다.
     * @param data A {@link IUpdate}
     * @param thumbnail 커플 대표사진
     */
    updateCouple: async (data: IUpdate, thumbnail?: File): Promise<void> => {
        let isUpload = false;
        let path: string | null = null;
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

        const prevThumbnail: string | null = couple.thumbnail;

        try {
            if (thumbnail) {
                const reqFileName = thumbnail.originalFilename!;
                const isDefault = isDefaultFile(reqFileName);

                if (isDefault) {
                    path = null;
                } else {
                    path = `${folderName}/${data.cupId}/thumbnail/${dayjs().valueOf()}.${reqFileName}`;

                    await uploadFile(path, thumbnail.filepath);
                    isUpload = true;
                }

                data.thumbnail = path;
            }

            await couple.update(data);
            logger.debug(`Update Data => ${JSON.stringify(data)}`);

            // Upload, DB Update를 하고나서 기존 이미지 지우기
            if (prevThumbnail && data.thumbnail) {
                await deleteFile(prevThumbnail);
                logger.debug(`Deleted already thumbnail => ${prevThumbnail}`);
            }
        } catch (error) {
            // Firebase에는 업로드 되었지만 DB 오류가 발생했다면 Firebase Profile 삭제
            if (data.thumbnail && isUpload) {
                await deleteFile(path!);
                logger.error(`After updating the firebase, a db error occurred and the firebase thumbnail is deleted => ${path}`);
            }

            throw error;
        }
    },
    /**
     * Couple 삭제 하는 메소드
     * Couple 삭제 시 thumbnail은 삭제하지 않으며, Admin API에서 Couple 삭제 시 처리
     * @param userId User Id
     * @param cupId Couple Id
     * @returns ITokenResponse: Access, Refresh Token
     */
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

        const transaction = await sequelize.transaction();

        try {
            const currentTime = new Date(dayjs().valueOf());

            await user1.update({ cupId: null }, { transaction });
            await user2.update({ cupId: null }, { transaction });
            await couple.update(
                {
                    deleted: true,
                    deletedTime: currentTime
                },
                { transaction }
            );

            const role: UserRole | null = await UserRole.findOne({
                where: { userId: user1.userId },
                include: {
                    model: Role,
                    as: "role"
                }
            });

            if (!role) throw new UnauthorizedError("Invalid Role");

            const result: ITokenResponse = await jwt.createToken(userId, null, role.roleId);

            transaction.commit();
            logger.debug(`Success Update and Delete couple => ${user1.userId}, ${user2.userId}, ${cupId}`);

            return result;
        } catch (error) {
            transaction.rollback();

            throw error;
        }
    }
};

export default controller;
