import dayjs from "dayjs";
import { Op, Transaction } from "sequelize";
import { File } from "formidable";
import { boolean } from "boolean";

import logger from "../logger/logger.js";
import { deleteFile, deleteFiles, deleteFolder } from "../utils/firebase.util";
import { createDigest } from "../utils/password.util.js";

import sequelize from "../models/index.js";
import { User, IUserResponseWithCount, PageOptions, SearchOptions, FilterOptions, IUpdateWithAdmin, ICreateWithAdmin } from "../models/user.model.js";
import { UserRole } from "../models/userRole.model.js";
import { Album } from "../models/album.model.js";
import { Calendar } from "../models/calendar.model.js";
import { InquireImage } from "../models/inquiryImage.model.js";

import NotFoundError from "../errors/notFound.error.js";
import ConflictError from "../errors/conflict.error.js";

import UserAdminService from "../services/user.admin.service.js";
import UserService from "../services/user.service.js";
import UserRoleService from "../services/userRole.service.js";
import InquireService from "../services/inquiry.service.js";
import AlbumService from "../services/album.service.js";
import CalendarService from "../services/calendar.service.js";
import CoupleAdminService from "../services/couple.admin.service.js";
import InquireImageService from "../services/inquiryImage.service.js";
import SolutionImageAdminService from "../services/solutionImage.admin.service.js";

class UserAdminController {
  private userService: UserService;
  private userAdminService: UserAdminService;
  private userRoleService: UserRoleService;
  private coupleAdminService: CoupleAdminService;
  private albumService: AlbumService;
  private calendarService: CalendarService;
  private inquireService: InquireService;
  private solutionImageAdminService: SolutionImageAdminService;

  constructor(
    userService: UserService,
    userAdminService: UserAdminService,
    userRoleService: UserRoleService,
    coupleAdminService: CoupleAdminService,
    albumService: AlbumService,
    calendarService: CalendarService,
    inquireService: InquireService,
    solutionImageAdminService: SolutionImageAdminService
  ) {
    this.userService = userService;
    this.userAdminService = userAdminService;
    this.userRoleService = userRoleService;
    this.coupleAdminService = coupleAdminService;
    this.albumService = albumService;
    this.calendarService = calendarService;
    this.inquireService = inquireService;
    this.solutionImageAdminService = solutionImageAdminService;
  }

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
  async getUsersWithSearch(pageOptions: PageOptions, searchOptions: SearchOptions, filterOptions: FilterOptions): Promise<IUserResponseWithCount> {
    const [rows, count]: [User[], number] = await this.userAdminService.select(pageOptions, searchOptions, filterOptions);
    if (rows.length <= 0 && count === 0) throw new NotFoundError("Not found users");

    const result: IUserResponseWithCount = {
      users: rows,
      count: count
    };

    return result;
  }

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
  async createUser(data: ICreateWithAdmin, file?: File): Promise<string> {
    let createdUser: User | null = null;

    const user: User | null = await this.userService.select({
      [Op.or]: [{ email: data.email }, { phone: data.phone }, { code: data.code }]
    });

    if (user) throw new ConflictError("Duplicated User");
    if (!data.code) data.code = await this.userService.createCode();

    let transaction: Transaction | undefined = undefined;
    data.password = await createDigest(data.password);

    try {
      transaction = await await sequelize.transaction();

      createdUser = await this.userAdminService.create(transaction, data);
      await this.userRoleService.create(transaction, createdUser.userId, data.role);

      if (file) {
        const path: string | null = this.userService.createProfile(createdUser.userId, file);

        if (path) {
          createdUser.profile = path;
          await this.userService.update(transaction, createdUser, { profile: path }, file);
        }
      }

      await transaction.commit();
      logger.debug(`Created User => ${data.email}`);

      const url: string = this.userAdminService.getURL();
      return url;
    } catch (error) {
      // Firebase에는 업로드 되었지만 DB 오류가 발생했다면 Firebase Profile 삭제
      if (createdUser?.profile) {
        await deleteFile(createdUser.profile);
        logger.error(`After updating the firebase, a db error occurred and the firebase profile is deleted => ${data.profile}`);
      }

      if (transaction) await transaction.rollback();
      logger.error(`User create error => ${JSON.stringify(error)}`);

      throw error;
    }
  }

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
  async updateUser(userId: number, data: IUpdateWithAdmin, file?: File): Promise<User> {
    let updatedUser: User | null = null;
    const user: User | null = await this.userService.select({ userId });
    if (!user) throw new NotFoundError("Not Found User");

    let transaction: Transaction | undefined = undefined;

    try {
      transaction = await sequelize.transaction();
      const prevProfile: string | null = user.profile;

      if (data.role) {
        const userRole: UserRole | null = await this.userRoleService.select(userId);
        if (!userRole) throw new NotFoundError(`Not found User Role. userId : ${userId}`);

        await this.userRoleService.update(transaction, userRole, data.role);
      }

      if (data.password) data.password = await createDigest(data.password);
      if (boolean(data.deleted)) data.deletedTime = new Date(dayjs().valueOf());
      else if (data.deleted !== undefined && boolean(data.deleted) === false) data.deletedTime = null;

      updatedUser = await this.userAdminService.update(transaction, user, data, file);
      await transaction.commit();

      if (prevProfile && file) await deleteFile(prevProfile);

      logger.debug(`Update Data => UserId : ${user.userId} | ${JSON.stringify(data)}`);

      return updatedUser;
    } catch (error) {
      // Firebase에는 업로드 되었지만 DB 오류가 발생했다면 Firebase Profile 삭제
      if (updatedUser?.profile) {
        await deleteFile(updatedUser.profile);
        logger.error(`After updating the firebase, a db error occurred and the firebase profile is deleted => ${data.profile}`);
      }

      if (transaction) await transaction.rollback();
      throw error;
    }
  }

  /**
   * Admin API 전용이며, 1개 이상의 유저를 DB 데이터에서 삭제합니다.
   * User에 관한 Couple, Album, Calendar, Inquire의 모든 정보가 삭제됩니다.
   * @param userIds User Id List
   */
  async deleteUser(userIds: number[]): Promise<void> {
    const allDeleteFiles: string[] = [];
    const deleteFolders: string[] = [];
    const users: User[] = await this.userAdminService.selectAllWithAdditional(userIds);
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

      // Inquire 삭제
      for (const user of userHasInquiry) {
        const inquireIds: number[] = user.inquires!.map((inquire) => inquire.inquireId);

        await this.inquireService.deletes(transaction, inquireIds);
        for (const inquire of user.inquires!) {
          if (inquire.solution?.solutionImages) {
            deleteFolders.push(this.solutionImageAdminService.getFolderPath(inquire.userId, inquire.inquireId));
          }

          inquire.inquireImages?.forEach((inquire: InquireImage) => {
            allDeleteFiles.push(inquire.image);
          });
        }
      }

      for (const user of userHasCouple) {
        const albums: Album[] = await this.albumService.selectWithCouple(user.couple!);
        const calendars: Calendar[] = await this.calendarService.selectWithCouple(user.couple!);

        if (albums && albums.length > 0) {
          for (const album of albums) {
            if (album.thumbnail) allDeleteFiles.push(album.thumbnail);
            deleteFolders.push(this.albumService.getAlbumFolderPath(album.cupId, album.albumId));

            await this.albumService.delete(transaction, album);
          }
        }

        if (calendars && calendars.length > 0) {
          const calendarIds: number[] = [];
          calendars.forEach((calendar: Calendar) => {
            calendarIds.push(calendar.calendarId);
          });

          await this.calendarService.deleteAll(transaction, calendarIds);
        }

        if (user.couple!.thumbnail) allDeleteFiles.push(user.couple!.thumbnail);
        await this.coupleAdminService.delete(transaction, user.couple!);
      }

      for (const user of users) {
        await this.userAdminService.delete(transaction, user);
        if (user.profile) allDeleteFiles.push(user.profile);
      }

      await transaction.commit();

      await deleteFiles(allDeleteFiles);
      for (const folderPath of deleteFolders) {
        await deleteFolder(folderPath);
      }
    } catch (error) {
      if (transaction) await transaction.rollback();
      throw error;
    }
  }
}

export default UserAdminController;