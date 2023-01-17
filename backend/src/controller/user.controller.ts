import dayjs from "dayjs";
import randomString from "randomstring";

import { User, ICreateData, IUpdateData, IDeleteData } from "../model/user.model";

import { createDigest } from "../util/password";

import NotFoundError from "../error/notFound";
import ForbiddenError from "../error/forbidden";

const controller = {
    getUser: async (userId: string): Promise<User> => {
        const user: User | null = await User.findOne({
            attributes: { exclude: ["password"] },
            where: {
                userId: userId
            }
        });

        if (!user) throw new NotFoundError("Not Found User");

        if (user.cupId !== null) {
            // Couple Select
        }

        return user;
    },
    createUser: async (data: ICreateData): Promise<void> => {
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
    updateUser: async (data: IUpdateData): Promise<void> => {
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
        if (data.profile) updateData.profile = data.profile;
        if (data.primaryNofi !== undefined) updateData.primaryNofi = data.primaryNofi;
        if (data.dateNofi !== undefined) updateData.dateNofi = data.dateNofi;
        if (data.eventNofi !== undefined) updateData.eventNofi = data.eventNofi;

        await user.update(updateData);
    },
    deleteUser: async (data: IDeleteData): Promise<void> => {
        await User.update(
            {
                deleted: true,
                deletedTime: new Date(dayjs().valueOf())
            },
            {
                where: {
                    userId: data.userId
                }
            }
        );
    }
};

export default controller;
