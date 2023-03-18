import dayjs from "dayjs";
import randomString from "randomstring";
import { Op, OrderItem, Transaction, WhereOptions } from "sequelize";
import { File } from "formidable";
import { boolean } from "boolean";

import logger from "../logger/logger";
import { deleteFile, isDefaultFile, uploadFile } from "../util/firebase";
import { createDigest } from "../util/password";

import sequelize from "../model";
import { User, IUserResponseWithCount, PageOptions, SearchOptions, FilterOptions, IUpdateWithAdmin, ICreateWithAdmin } from "../model/user.model";
import { Solution } from "../model/solution.model";
import { UserRole } from "../model/userRole.model";
import { Couple } from "../model/couple.model";
import { Album } from "../model/album.model";
import { Inquire } from "../model/inquire.model";

import albumController from "./album.controller";
import inquireController from "./inquire.controller";

import NotFoundError from "../error/notFound";
import ConflictError from "../error/conflict";

const FOLDER_NAME = "users";

const createSort = (sort: string): OrderItem => {
    let result: OrderItem = ["name", "ASC"];

    switch (sort) {
        case "na":
            result = ["name", "ASC"];
            break;
        case "nd":
            result = ["name", "DESC"];
            break;
        case "r":
            result = ["createdTime", "DESC"];
            break;
        case "o":
            result = ["createdTime", "ASC"];
            break;
        case "dr":
            result = ["deletedTime", "DESC"];
            break;
        case "do":
            result = ["deletedTime", "ASC"];
            break;
        default:
            result = ["name", "ASC"];
            break;
    }

    return result;
};

const createWhere = (searchOptions: SearchOptions, filterOptions: FilterOptions): WhereOptions => {
    let result: WhereOptions = {};

    if (searchOptions.name && searchOptions.name !== "undefined") result["name"] = { [Op.like]: `%${searchOptions.name}%` };
    if (searchOptions.snsId && searchOptions.snsId !== "undefined") result["snsId"] = searchOptions.snsId;
    if (filterOptions.isCouple) result["cupId"] = { [Op.not]: null };
    if (filterOptions.isDeleted) result["deleted"] = true;

    return result;
};

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

const createProfilePath = (userId: number, file: File): string | null => {
    let path: string | null = "";
    const reqFileName = file.originalFilename!;
    const isDefault = isDefaultFile(reqFileName);

    /**
     * Frontend에선 static으로 default.jpg,png,svg 셋 중 하나 갖고있다가
     * 사용자가 profile을 내리면 그걸로 넣고 요청
     */
    if (isDefault) path = null;
    else path = `${FOLDER_NAME}/${userId}/profile/${dayjs().valueOf()}.${reqFileName}`;

    return path;
};

const controller = {
    /**
     * Admin API 전용이며 Pagination, Sort, Search 등을 사용하여 검색할 수 있습니다.
     * ```typescript
     * const pageOptions: PageOptions = {
     *      page: 1,
     *      count 5,
     *      sort: "r"
     * };
     * // This object value not required.
     * const searchOptions: SearchOptions = {
     *      name: "용",     // This using mysql "Like" method.
     *      snsId: 1001
     * };
     * const filterOptions: FilterOptions = {
     *      isCouple: true,     // Get only users with couple.
     *      isDeleted: true     // Get only deleted users.
     * };
     *
     * const result = await getUsersWithSearch(pageOptions, SearchOptions, FilterOptions);
     * ```
     * @param pageOptions A {@link PageOptions}
     * @param searchOptions A {@link SearchOptions}
     * @param filterOptions A {@link FilterOptions}
     * @returns A {@link IUserResponseWithCount}
     */
    getUsersWithSearch: async (pageOptions: PageOptions, searchOptions: SearchOptions, filterOptions: FilterOptions): Promise<IUserResponseWithCount> => {
        const offset = (pageOptions.page - 1) * pageOptions.count;
        const sort: OrderItem = createSort(pageOptions.sort);
        const where: WhereOptions = createWhere(searchOptions, filterOptions);

        const { rows, count }: { rows: User[]; count: number } = await User.findAndCountAll({
            offset: offset,
            limit: pageOptions.count,
            order: [sort],
            where
        });

        const result: IUserResponseWithCount = {
            users: rows,
            count: count
        };

        return result;
    },
    /**
     * Admin API 전용이며, 기존 Create보다 더 많은 정보를 생성할 수 있습니다.
     * ```typescript
     * const data: ICreateWithAdmin = {
     *      snsId: "1001",
     *      name: "이름",
            email: "email@email.com",
            code: "AAAAAA",                             // 영어 대소문자 및 숫자로 이루어진 6글자
            password: "password123!",                   // 8~15글자 및 특수문자를 포함해야 함
            phone: "01085297193",
            birthday: 2000-11-26,                       // 1980-01-01 ~ 2023-12-31
            primaryNofi: true,      
            eventNofi: true,
            dateNofi: false,
            role: 1
     * };
     * await updateUserWithAdmin(data);
     * await updateUserWithAdmin(data, file);   // create profile
     * ```
     * @param data A {@link ICreateWithAdmin}
     * @param file A {@link File} | undefined
     */
    createUser: async (data: ICreateWithAdmin, file?: File): Promise<void> => {
        let isUpload = false;
        let path: string | null = "";
        const user: User | null = await User.findOne({
            where: {
                [Op.or]: [{ email: data.email }, { phone: data.phone }]
            }
        });

        if (user) throw new ConflictError("Duplicated User");
        if (data.code) {
            const user: User | null = await User.findOne({
                where: { code: data.code }
            });

            if (user) data.code = await createCode();
        } else {
            data.code = await createCode();
        }

        let transaction: Transaction | undefined = undefined;
        const hash: string = await createDigest(data.password);
        data.password = hash;

        try {
            transaction = await await sequelize.transaction();

            const createdUser: User = await User.create(
                {
                    snsId: data.snsId,
                    name: data.name,
                    email: data.email,
                    code: data.code,
                    password: hash,
                    phone: data.phone,
                    birthday: data.birthday,
                    primaryNofi: boolean(data.primaryNofi),
                    eventNofi: boolean(data.eventNofi),
                    dateNofi: boolean(data.dateNofi)
                },
                { transaction }
            );

            await UserRole.create(
                {
                    userId: createdUser.userId,
                    roleId: data.role
                },
                { transaction }
            );

            if (file) {
                data.profile = createProfilePath(createdUser.userId, file);
                await createdUser.update({ profile: data.profile }, { transaction });
                await uploadFile(path, file.filepath);
                isUpload = true;
            }

            await transaction.commit();
        } catch (error) {
            // Firebase에는 업로드 되었지만 DB 오류가 발생했다면 Firebase Profile 삭제
            if (file && isUpload) {
                await deleteFile(path!);
                logger.error(`After updating the firebase, a db error occurred and the firebase profile is deleted => ${path}`);
            }

            if (transaction) await transaction.rollback();
            logger.error(`User create error => ${JSON.stringify(error)}`);

            throw error;
        }

        logger.debug(`Created User => ${data.email}`);
    },
    /**
     * Admin API이며 전용이며, 기존 Update보다 더 많은 정보를 수정할 수 있습니다.
     * ```typescript
     * const userId = 24;
     * 
     * // Object value not required. (Allow undefined)
     * const data: IUpdateAll = {
     *      name: "이름",
            email: "email@email.com",
            code: "AAAAAA",                             // 영어 대소문자 및 숫자로 이루어진 6글자
            password: "password123!",                   // 8~15글자 및 특수문자를 포함해야 함
            phone: "01085297193",
            birthday: 2000-11-26,                       // 1980-01-01 ~ 2023-12-31
            primaryNofi: true,      
            eventNofi: true,
            dateNofi: false,
            deleted: false                              // 실제 DB에서 삭제되지 않습니다.
     * };
     * 
     * await updateUserWithAdmin(userId, data);
     * await updateUserWithAdmin(userId, data, file);   // update or create profile
     * 
     * ```
     * @param userId User Id
     * @param data A {@link IUpdateAll}
     * @param file A {@link File}
     */
    updateUser: async (userId: number, data: IUpdateWithAdmin, file?: File): Promise<void> => {
        let isUpload = false;
        let path: string | null = "";

        const user: User | null = await User.findOne({
            where: { userId }
        });
        if (!user) throw new NotFoundError("Not Found User");

        let prevProfile: string | null = user.profile;
        let transaction: Transaction | undefined = undefined;

        try {
            transaction = await sequelize.transaction();

            if (data.role) {
                const userRole: UserRole | null = await UserRole.findOne({ where: { userId } });

                if (!userRole) throw new NotFoundError(`Not found User Role. userId : ${userId}`);
                await userRole.update({ roleId: data.role }, { transaction });
            }

            if (data.password) data.password = await createDigest(data.password);
            if (boolean(data.deleted)) data.deletedTime = new Date(dayjs().valueOf());
            else if (data.deleted !== undefined && boolean(data.deleted) === false) data.deletedTime = null;

            if (file) {
                data.profile = createProfilePath(userId, file);

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

            await user.update(data, { transaction });
            logger.debug(`Update Data => ${JSON.stringify(data)}`);

            await transaction.commit();
        } catch (error) {
            // Firebase에는 업로드 되었지만 DB 오류가 발생했다면 Firebase Profile 삭제
            if (data.profile && isUpload) {
                await deleteFile(path!);
                logger.error(`After updating the firebase, a db error occurred and the firebase profile is deleted => ${path}`);
            }

            if (transaction) await transaction.rollback();
            throw error;
        }
    },
    /**
     * Admin API 전용이며, 1개 이상의 유저를 DB 데이터에서 삭제합니다.
     * User에 관한 Couple, Album, Calendar, Inquire의 모든 정보가 삭제됩니다.
     * @param userIds User Id List
     */
    deleteUser: async (userIds: number[]): Promise<void> => {
        const users: User[] = await User.findAll({
            where: { userId: userIds },
            include: [
                {
                    model: Couple,
                    as: "couple"
                },
                {
                    model: Inquire,
                    as: "inquires",
                    include: [
                        {
                            model: Solution,
                            as: "solution"
                        }
                    ]
                }
            ]
        });

        if (users.length <= 0) throw new NotFoundError("Not found users.");

        const userHasInquiry = users.filter((user: User) => {
            if (user.inquires) return user;
        });
        const userHasCouple = users.filter((user: User) => {
            if (user.cupId) return user;
        });
        let transaction: Transaction | undefined = undefined;

        try {
            transaction = await sequelize.transaction();

            // inquire 삭제(image), couple 삭제(thumbnail), 다른 couple user cupId null 처리, user thumbnail 삭제, 유저 삭제

            // Inquire 삭제
            for (const user of userHasInquiry) {
                for (const inquire of user.inquires!) {
                    await inquireController.deleteInquire(inquire.inquireId);
                    // soluton image 삭제
                    // if (inquire.solution) await solutionController.deleteSolution(inquire.solution.solutionId);
                }
            }

            for (const user of userHasCouple) {
                const otherUser: User[] = (await user.couple!.getUsers()).filter((coupleUser: User) => {
                    if (coupleUser.userId != user.userId) return user;
                });
                const albums: Album[] = await user.couple!.getAlbums();

                if (albums) {
                    for (const album of albums) {
                        // await albumController.deleteAlbum(user.cupId!, album.albumId);
                    }
                }

                await otherUser[0].update({ cupId: null });

                if (user.couple!.thumbnail) await deleteFile(user.couple!.thumbnail);
                await user.couple!.destroy();
            }
        } catch (error) {}

        users.forEach(async (user: User) => {
            const profile: string | null = user.profile;

            if (profile) await deleteFile(profile);
            await user.destroy();
        });
    }
};

export default controller;
