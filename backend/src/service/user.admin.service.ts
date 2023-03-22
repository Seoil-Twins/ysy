import { boolean } from "boolean";
import { File } from "formidable";
import { Op, OrderItem, Transaction, WhereOptions } from "sequelize";

import { API_ROOT } from "..";
import { Service } from "./service";

import logger from "../logger/logger";
import { deleteFile, uploadFile } from "../util/firebase";

import { Couple } from "../model/couple.model";
import { Inquire } from "../model/inquire.model";
import { Solution } from "../model/solution.model";
import { FilterOptions, ICreateWithAdmin, IUpdateWithAdmin, PageOptions, SearchOptions, User } from "../model/user.model";

class UserAdminService extends Service {
    private createSort(sort: string): OrderItem {
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
    }

    private createWhere(searchOptions: SearchOptions, filterOptions: FilterOptions): WhereOptions {
        let result: WhereOptions = {};

        if (searchOptions.name && searchOptions.name !== "undefined") result["name"] = { [Op.like]: `%${searchOptions.name}%` };
        if (searchOptions.snsId && searchOptions.snsId !== "undefined") result["snsId"] = searchOptions.snsId;
        if (filterOptions.isCouple) result["cupId"] = { [Op.not]: null };
        if (filterOptions.isDeleted) result["deleted"] = true;

        return result;
    }

    getURL(): string {
        return `${API_ROOT}/admin/user?page=1&count=1&sort=r`;
    }

    async select(pageOptions: PageOptions, searchOptions: SearchOptions, filterOptions: FilterOptions): Promise<[User[], number]> {
        const offset = (pageOptions.page - 1) * pageOptions.count;
        const sort: OrderItem = this.createSort(pageOptions.sort);
        const where: WhereOptions = this.createWhere(searchOptions, filterOptions);

        const { rows, count }: { rows: User[]; count: number } = await User.findAndCountAll({
            offset: offset,
            limit: pageOptions.count,
            order: [sort],
            where
        });

        return [rows, count];
    }

    async selectAllWithAdditional(userIds: number[]): Promise<User[]> {
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

        return users;
    }

    async create(transaction: Transaction | null = null, data: ICreateWithAdmin): Promise<User> {
        const createdUser: User = await User.create(
            {
                snsId: data.snsId,
                name: data.name,
                email: data.email,
                code: data.code!,
                password: data.password,
                phone: data.phone,
                birthday: data.birthday,
                primaryNofi: boolean(data.primaryNofi),
                eventNofi: boolean(data.eventNofi),
                dateNofi: boolean(data.dateNofi)
            },
            { transaction }
        );

        return createdUser;
    }

    async update(transaction: Transaction | null = null, user: User, data: IUpdateWithAdmin, file?: File): Promise<User> {
        let isUpload = false;
        const prevProfile: string | null = user.profile;
        const updatedUser: User = await user.update(data, { transaction });

        try {
            if (file) {
                if (data.profile) {
                    await uploadFile(data.profile, file.filepath);
                    isUpload = true;

                    if (prevProfile) await deleteFile(prevProfile); // 전에 있던 profile 삭제
                } else if (prevProfile && !data.profile) {
                    // default 이미지로 변경시
                    await deleteFile(prevProfile);
                }
            }
        } catch (error) {
            // Firebase에는 업로드 되었지만 DB 오류가 발생했다면 Firebase Profile 삭제
            if (data.profile && isUpload) {
                await deleteFile(data.profile);
                logger.error(`After updating the firebase, a db error occurred and the firebase profile is deleted => ${data.profile}`);
            }

            throw error;
        }

        return updatedUser;
    }

    async delete(transaction: Transaction | null = null, user: User): Promise<void> {
        const profile: string | null = user.profile;

        await user.destroy({ transaction });

        if (profile) deleteFile(profile);
    }
}

export default UserAdminService;
