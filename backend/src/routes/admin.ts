import AdminJS, { AdminJSOptions, CurrentAdmin, ResourceOptions } from "adminjs";
import AdminJSExpress from "@adminjs/express";
import * as AdminJSSequelize from "@adminjs/sequelize";
import dotenv from "dotenv";

import { IUserRoleResult, User } from "../model/user.model";
import { Couple } from "../model/couple.model";
import { Album } from "../model/album.model";
import { Calendar } from "../model/calendar.model";
import { Inquire } from "../model/inquire.model";
import { Notice } from "../model/notice.model";
import { Solution } from "../model/solution.model";
import { ErrorImage } from "../model/errorImage.model";
import { UserRole } from "../model/userRole.model";
import { Role } from "../model/role.model";

import { checkPassword } from "../util/password";

dotenv.config();

// Connect MySQL
AdminJS.registerAdapter({
    Resource: AdminJSSequelize.Resource,
    Database: AdminJSSequelize.Database
});

const canModifyAdmin = ({ currentAdmin }: { currentAdmin: CurrentAdmin }) => {
    return currentAdmin && currentAdmin.role.name === "admin";
};

const canModifyEditor = ({ currentAdmin }: { currentAdmin: CurrentAdmin }) => {
    return currentAdmin && (currentAdmin.role.name === "admin" || currentAdmin.role.name === "editor");
};

const actionOptions = {
    edit: { isAccessible: canModifyEditor },
    delete: { isAccessible: canModifyEditor },
    new: { isAccessible: canModifyEditor }
};

const adminOptions: AdminJSOptions = {
    branding: {
        companyName: "YSY Admin"
    },
    resources: [
        {
            resource: Role,
            options: {
                actions: {
                    edit: { isAccessible: canModifyAdmin },
                    delete: { isAccessible: canModifyAdmin },
                    new: { isAccessible: canModifyAdmin }
                }
            }
        },
        {
            resource: UserRole,
            options: {
                actions: {
                    edit: { isAccessible: canModifyAdmin },
                    delete: { isAccessible: canModifyAdmin },
                    new: { isAccessible: canModifyAdmin }
                }
            }
        },
        {
            resource: User,
            options: {
                properties: {
                    deleted: { isRequired: false },
                    deletedTime: { isRequired: false },
                    createdTime: { isDisabled: true }
                },
                action: actionOptions
            }
        },
        {
            resource: Couple,
            options: actionOptions
        },
        {
            resource: Album,
            options: actionOptions
        },
        {
            resource: Calendar,
            options: actionOptions
        },
        {
            resource: Inquire,
            options: actionOptions
        },
        {
            resource: Notice,
            options: actionOptions
        },
        {
            resource: Solution,
            options: actionOptions
        },
        {
            resource: ErrorImage,
            options: actionOptions
        }
    ]
};

const authenticate = async (email: string, password: string) => {
    const user: User | null = await User.findOne({
        where: { email },
        include: {
            model: UserRole,
            as: "userRole"
        }
    });

    if (user) {
        const isCheck: boolean = await checkPassword(password, user.password);
        const role: Role | null = await Role.findByPk(user.userRole!.roleId);

        if (isCheck && role) {
            const result: IUserRoleResult = {
                userId: user.userId,
                cupId: user.cupId,
                snsId: user.snsId,
                code: user.code,
                name: user.name,
                email: user.email,
                birthday: user.birthday,
                phone: user.phone,
                profile: user.profile,
                primaryNofi: user.primaryNofi,
                dateNofi: user.dateNofi,
                eventNofi: user.eventNofi,
                createdTime: user.createdTime,
                deleted: user.deleted,
                deletedTime: user.deletedTime,
                role
            };

            return result;
        }
    }

    return null;
};

export const admin = new AdminJS(adminOptions);
export const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
    admin,
    {
        authenticate,
        cookieName: process.env.COOKIE_NAME,
        cookiePassword: String(process.env.COOKIE_PASSWORD)
    },
    null,
    {
        resave: true,
        saveUninitialized: true
    }
);
