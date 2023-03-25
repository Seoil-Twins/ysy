import dayjs from "dayjs";
import { boolean } from "boolean";
import { File } from "formidable";
import { Op, OrderItem, Transaction, WhereOptions } from "sequelize";

import { API_ROOT } from "..";
import { Service } from "./service";

import { isDefaultFile, uploadFile } from "../util/firebase";

import { Couple } from "../model/couple.model";
import { Inquire } from "../model/inquire.model";
import { Solution } from "../model/solution.model";
import { FilterOptions, ICreateWithAdmin, IUpdateWithAdmin, PageOptions, SearchOptions, User } from "../model/user.model";

class UserAdminService extends Service {
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
        if (file) data.profile = this.createProfile(user.userId, file);
        const updatedUser: User = await user.update(data, { transaction });

        if (file && data.profile) await uploadFile(data.profile, file.filepath);
        return updatedUser;
    }

    async delete(transaction: Transaction | null = null, user: User): Promise<void> {
        await user.destroy({ transaction });
    }
}

export default UserAdminService;
