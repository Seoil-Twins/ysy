import dayjs from "dayjs";
import { Op, Transaction } from "sequelize";

import logger from "../logger/logger.js";
import { createDigest } from "../utils/password.util.js";
import { PageOptions } from "../utils/pagination.util.js";
import {
  DeleteImageInfo,
  File,
  MimeType,
  UploadImageInfo,
  deleteFileWithGCP,
  deleteFilesWithGCP,
  getFileBufferWithGCP,
  uploadFileWithGCP
} from "../utils/gcp.util.js";

import sequelize from "../models/index.js";
import { User } from "../models/user.model.js";
import { Admin } from "../models/admin.model.js";
import { Album } from "../models/album.model.js";

import { UNKNOWN_NAME } from "../constants/file.constant.js";

import { SearchOptions, FilterOptions, SortItem, ResponseUsersWithAdmin, UpdateUserWithAdmin, CreateUserWithAdmin } from "../types/user.type.js";

import NotFoundError from "../errors/notFound.error.js";
import ConflictError from "../errors/conflict.error.js";

import UserAdminService from "../services/user.admin.service.js";
import UserService from "../services/user.service.js";
import UserRoleService from "../services/userRole.service.js";
import CoupleAdminService from "../services/couple.admin.service.js";
import AdminService from "../services/admin.service.js";

class UserAdminController {
  private ERROR_LOCATION_PREFIX = "adminUser";
  private userService: UserService;
  private userAdminService: UserAdminService;
  private userRoleService: UserRoleService;
  private adminService: AdminService;
  private coupleAdminService: CoupleAdminService;

  constructor(
    userService: UserService,
    userAdminService: UserAdminService,
    userRoleService: UserRoleService,
    adminService: AdminService,
    coupleAdminService: CoupleAdminService
  ) {
    this.userService = userService;
    this.userAdminService = userAdminService;
    this.userRoleService = userRoleService;
    this.adminService = adminService;
    this.coupleAdminService = coupleAdminService;
  }

  async getUser(userId: number): Promise<User> {
    const user: User | null = await this.userAdminService.selectWithCouple(userId);
    if (!user) throw new NotFoundError(`Not found user with using userId => ${userId}`);

    return user;
  }

  /**
   * Pagination, Sort, Search 등을 사용하여 검색할 수 있습니다.
   * ```typescript
   * // This Generic Type of CreatePageOption is User SortItem.
   * const createPageOptions: CreatePageOption<SortItem> = {
   *   count: Number(req.query.count),
   *   page: Number(req.query.page),
   *   sort: String(req.query.sort),
   *   defaultValue: "r",
   *   isSortItem: isSortItem
   * };
   * const pageOptions: PageOptions<SortItem> = createPageOption<SortItem>(createPageOptions);
   *
   * // This object value not required.
   * const searchOptions: SearchOptions = {
   *      name: "용",     // This using mysql "Like" method.
   *      snsId: 1001
   * };
   * const filterOptions: FilterOptions = {
   *      isProfile: true,    // Get only users with profile.
   *      isCouple: true,     // Get only users with couple.
   *      isDeleted: true     // Get only deleted users.
   * };
   *
   * const result = await getUsers(pageOptions, SearchOptions, FilterOptions);
   * ```
   * @param pageOptions A {@link PageOptions PageOptions<SortItem>}
   * @param searchOptions A {@link SearchOptions}
   * @param filterOptions A {@link FilterOptions}
   * @returns Promise\<{@link ResponseUsersWithAdmin}\>
   */
  async getUsers(pageOptions: PageOptions<SortItem>, searchOptions: SearchOptions, filterOptions: FilterOptions): Promise<ResponseUsersWithAdmin> {
    const [rows, count]: [User[], number] = await this.userAdminService.select(pageOptions, searchOptions, filterOptions);
    if (rows.length <= 0 && count === 0) {
      return {
        users: [],
        total: 0
      };
    }

    const result: ResponseUsersWithAdmin = {
      users: rows,
      total: count
    };

    return result;
  }

  /**
     * 기존 Create보다 더 많은 정보를 생성할 수 있습니다.
     * 
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
     * await createUser(data);
     * await createUser(data, file);                     // create profile
     * ```
     * @param data A {@link CreateUserWithAdmin}
     * @param file A {@link File} | undefined
     */
  async createUser(data: CreateUserWithAdmin, profile?: File): Promise<string> {
    let transaction: Transaction | null = null;
    let createdUser: User | null = null;

    const user: User | null = await this.userService.select({
      [Op.or]: [{ email: data.email }, { phone: data.phone }, { snsId: data.snsId }, { code: data.code }]
    });
    if (user) throw new ConflictError("Duplicated User");

    try {
      transaction = await sequelize.transaction();

      if (data.deleted) {
        data.deletedTime = dayjs().toDate();
      }

      const password: string | undefined = data.password;
      delete data["password"];

      createdUser = await this.userAdminService.create(transaction, data, profile);

      await this.userRoleService.create(transaction, createdUser.userId, data.role);

      if (password) {
        const encryptPassword = await createDigest(password);
        await this.adminService.create(transaction, {
          userId: createdUser.userId,
          password: encryptPassword
        });
      }

      await transaction.commit();

      const url: string = this.userAdminService.getURL();
      return url;
    } catch (error) {
      if (transaction) await transaction.rollback();

      if (createdUser?.profile) {
        await deleteFileWithGCP({
          path: createdUser.profile,
          location: `${this.ERROR_LOCATION_PREFIX}/createUser`,
          size: createdUser.profileSize!,
          type: createdUser.profileType!
        });
        logger.error(`After creating the gcp, a db error occurred and the gcp profile is deleted => ${profile}`);
      }

      logger.error(`User create error => ${JSON.stringify(error)}`);

      throw error;
    }
  }

  /**
   * 기존 Update보다 더 많은 정보를 수정할 수 있습니다.
   * 
   *```typescript
   const userId = 24;
   
   const data: UpdateUserWithAdmin = {
      snsId: "10101001",
      snsKind: "1001",
      code: "AAAAAA",               // 영어 대소문자 및 숫자로 이루어진 6글자
      name: "이름",
      email: "email@email.com",
      phone: "01085297193",
      birthday: 2000-11-26,         // 1980-01-01 ~ 2023-12-31
      primaryNofi: true,
      eventNofi: true,
      dateNofi: false,
      role: 3,
      // 8~15글자 및 특수문자를 포함해야 합니다. 또한, 해당 유저의 권한이 viewer가 아니어야합니다.
      password: "password123!",
      deleted: false                // 실제 DB에서 삭제되지 않습니다.
    };
      ```
   *
   * await updateUser(userId, data);
   * await updateUser(userId, data, file);   // update or create profile
   * @param userId 유저 아이디
   * @param data {@link UpdateUserWithAdmin}
   * @param profile {@link File} | undefined | null
   * @returns Promise\<{@link User}\>
   */
  async updateUser(userId: number, data: UpdateUserWithAdmin, profile?: File | null): Promise<User> {
    let transaction: Transaction | null = null;
    let updateUser: User | null = null;
    let prevFile: UploadImageInfo | null = null;

    const userByUserId: User | null = await this.userAdminService.selectWithUserRole(userId);
    if (!userByUserId) throw new NotFoundError("Not found user using token user ID");

    const alreadyUser: User | null = await this.userService.select({
      [Op.or]: [{ email: data?.email }, { phone: data?.phone }, { snsId: data?.snsId }, { code: data?.code }]
    });
    if (alreadyUser && alreadyUser.userId !== userId) {
      if (alreadyUser.email === data?.email) throw new ConflictError("Duplicated email");
      else if (alreadyUser.phone === data?.phone) throw new ConflictError("Duplicated phone");
      else if (alreadyUser.snsId === data?.snsId) throw new ConflictError("Duplicated snsId");
      else if (alreadyUser.code === data?.code) throw new ConflictError("Duplicated code");
    }

    try {
      transaction = await sequelize.transaction();

      if (userByUserId.deleted !== data.deleted && data.deleted === false) {
        data.deletedTime = null;
      } else if (userByUserId.deleted !== data.deleted && data.deleted === true) {
        data.deletedTime = dayjs().toDate();
      }

      const admin: Admin | null = await this.adminService.select({ userId });

      if (data.role) {
        await this.userRoleService.update(transaction, userByUserId.userRole!, data.role);
      }

      if (data.password) {
        const encryptPassword = await createDigest(data.password);

        if (admin && admin.password !== data.password) {
          await this.adminService.update(transaction, admin, {
            password: encryptPassword
          });
        } else if (!admin) {
          await this.adminService.create(transaction, {
            userId: userByUserId.userId,
            password: encryptPassword
          });
        }
      } else if (admin && data.role === 4) {
        await this.adminService.delete(transaction, admin);
      }

      const prevProfilePath: string | null = userByUserId.profile;
      const prevProfileSize: number = userByUserId.profileSize ? userByUserId.profileSize : 0;
      const prevProfileType: string = userByUserId.profileType ? userByUserId.profileType : UNKNOWN_NAME;
      const prevBuffer = prevProfilePath && prevProfileType !== MimeType.URL ? await getFileBufferWithGCP(prevProfilePath) : null;

      if (prevProfilePath && prevBuffer) {
        prevFile = {
          filename: prevProfilePath,
          buffer: prevBuffer,
          mimetype: prevProfileType,
          size: prevProfileSize
        };
      }

      if (profile) {
        updateUser = await this.userService.updateWithProfile(transaction, userByUserId, data, profile);
      } else if (profile === null) {
        updateUser = await this.userService.update(transaction, userByUserId, {
          ...data,
          profile: null,
          profileSize: null,
          profileType: null
        });
      } else {
        updateUser = await this.userService.update(transaction, userByUserId, data);
      }

      if (prevProfilePath && (profile || profile === null) && prevProfileType !== MimeType.URL) {
        await deleteFileWithGCP({
          path: prevProfilePath,
          location: `${this.ERROR_LOCATION_PREFIX}/updateUser`,
          size: prevProfileSize,
          type: prevProfileType
        });
      }

      await transaction.commit();

      return updateUser;
    } catch (error) {
      if (transaction) await transaction.rollback();

      if (updateUser?.profile) {
        await deleteFileWithGCP({
          path: updateUser.profile,
          location: `${this.ERROR_LOCATION_PREFIX}/updateUser`,
          size: updateUser.profileSize ? updateUser.profileSize : 0,
          type: updateUser.profileType ? updateUser.profileType : UNKNOWN_NAME
        });

        if (prevFile) {
          await uploadFileWithGCP({
            filename: prevFile.filename,
            buffer: prevFile.buffer,
            mimetype: prevFile.mimetype,
            size: prevFile.size
          });

          logger.error(`After updating the gcp, a db error occurred and the gcp profile is reuploaded => ${updateUser.profile}`);
        }

        logger.error(`After updating the gcp, a db error occurred and the gcp profile is deleted => ${profile}`);
      }

      throw error;
    }
  }

  /**
   * 1개 이상의 유저를 DB 데이터에서 삭제합니다.
   * User에 관한 Couple, Album, Album Image, Calendar, Inquiry의 모든 정보가 삭제됩니다.
   * @param userIds User Id List
   */
  async deleteUsers(userIds: number[]): Promise<void> {
    const deleteFiles: DeleteImageInfo[] = [];
    const deleteCoupleIds: string[] = [];
    const deleteUserIds: number[] = [];
    const users: User[] = await this.userAdminService.selectAllWithAdditional(userIds);
    if (users.length <= 0) throw new NotFoundError("Not found users.");

    const userHasCouple = users.filter((user: User) => {
      if (user.couple) return user;
    });
    let transaction: Transaction | undefined = undefined;

    try {
      transaction = await sequelize.transaction();

      for (const user of userHasCouple) {
        const albums: Album[] | undefined = user.couple!.albums;

        if (albums && albums.length > 0) {
          for (const album of albums) {
            if (album.thumbnail) {
              deleteFiles.push({
                location: `${this.ERROR_LOCATION_PREFIX}/deleteUsers`,
                path: album.thumbnail,
                size: album.thumbnailSize!,
                type: album.thumbnailType!
              });
            }

            if (album.albumImages) {
              for (const image of album.albumImages) {
                deleteFiles.push({
                  location: `${this.ERROR_LOCATION_PREFIX}/deleteUsers`,
                  path: image.path,
                  size: image.size,
                  type: image.type
                });
              }
            }
          }
        }

        if (user.couple!.thumbnail) {
          deleteFiles.push({
            location: `${this.ERROR_LOCATION_PREFIX}/deleteUsers`,
            path: user.couple!.thumbnail,
            size: user.couple!.thumbnailSize!,
            type: user.couple!.thumbnailType!
          });
        }

        deleteCoupleIds.push(user.couple!.cupId);
      }

      for (const user of users) {
        deleteUserIds.push(user.userId);

        if (user.profile) {
          deleteFiles.push({
            location: `${this.ERROR_LOCATION_PREFIX}/deleteUsers`,
            path: user.profile,
            size: user.profileSize!,
            type: user.profileType!
          });
        }
      }

      await this.coupleAdminService.deleteAll(transaction, deleteCoupleIds);
      await this.userAdminService.deleteAll(transaction, deleteUserIds);
      await transaction.commit();

      deleteFilesWithGCP(deleteFiles);
    } catch (error) {
      logger.error(`User deletes error in user admin api => ${JSON.stringify(error)}`);

      if (transaction) await transaction.rollback();
      throw error;
    }
  }
}

export default UserAdminController;
