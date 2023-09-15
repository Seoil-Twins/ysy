import AdminJS, { AdminJSOptions, CurrentAdmin } from "adminjs";
import AdminJSExpress from "@adminjs/express";
import * as AdminJSSequelize from "@adminjs/sequelize";

import { User } from "../models/user.model.js";
import { Couple } from "../models/couple.model.js";
import { Album } from "../models/album.model.js";
import { Calendar } from "../models/calendar.model.js";
import { Inquiry } from "../models/inquiry.model.js";
import { Notice } from "../models/notice.model.js";
import { Solution } from "../models/solution.model.js";
import { ErrorImage } from "../models/errorImage.model.js";
import { UserRole } from "../models/userRole.model.js";
import { Role } from "../models/role.model.js";
import { Admin } from "../models/admin.model.js";
import { checkPassword } from "../utils/password.util.js";

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
          snsKind: {
            availableValues: [
              { value: "1000", label: "카카오" },
              { value: "1001", label: "네이버" },
              { value: "1002", label: "구글" }
            ]
          },
          cupId: {
            isVisible: false
          },
          createdTime: {
            isDisabled: true
          },
          deleted: {
            isRequired: false,
            isVisible: false
          },
          deletedTime: {
            isRequired: false,
            isVisible: false
          }
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
      resource: Inquiry,
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
    include: [
      {
        model: UserRole,
        as: "userRole"
      },
      {
        model: Admin,
        as: "admin"
      }
    ]
  });

  if (user && user.admin) {
    const isCheck: boolean = await checkPassword(password, user.admin.password);
    const role: Role | null = await Role.findByPk(user.userRole!.roleId);

    if (isCheck && role) {
      const result = {
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
