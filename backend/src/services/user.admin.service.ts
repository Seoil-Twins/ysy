import dayjs from "dayjs";
import { Op, OrderItem, Transaction, WhereOptions } from "sequelize";

import { API_ROOT } from "../index.js";
import { Service } from "./service.js";

import { UNKNOWN_NAME } from "../constants/file.constant.js";

import { Couple } from "../models/couple.model.js";
import { User } from "../models/user.model.js";
import { UserRole } from "../models/userRole.model.js";
import { Album } from "../models/album.model.js";
import { AlbumImage } from "../models/albumImage.model.js";
import { Calendar } from "../models/calendar.model.js";

import { userSortOptions } from "../types/sort.type.js";
import { CreateUserWithAdmin, FilterOptions, SearchOptions, SortItem } from "../types/user.type.js";

import { PageOptions, createSortOptions } from "../utils/pagination.util.js";
import { File, uploadFileWithGCP } from "../utils/gcp.util.js";

class UserAdminService extends Service {
  private readonly FOLDER_NAME: string = "users";

  /**
   * 프로필 사진 경로를 생성합니다.
   *
   * @param userId 유저 ID
   * @param file 사진 객체
   * @returns string | null - 프로필 사진 경로 또는 없음
   */
  createProfile(userId: number, file: File): string {
    const reqFileName = file.originalname;
    const path: string = `${this.FOLDER_NAME}/${userId}/profile/${dayjs().valueOf()}.${reqFileName}`;

    return path;
  }

  private createWhere(searchOptions: SearchOptions, filterOptions: FilterOptions): WhereOptions {
    let result: WhereOptions<User> = {};

    if (searchOptions.name && searchOptions.name !== "undefined") {
      result["name"] = { [Op.like]: `%${searchOptions.name}%` };
    }
    if (searchOptions.snsKind && searchOptions.snsKind !== "undefined") {
      result["snsKind"] = searchOptions.snsKind;
    }
    if (filterOptions.isCouple) {
      result["cupId"] = { [Op.not]: null };
    }
    if (filterOptions.isProfile) {
      result["profile"] = { [Op.not]: null };
    }
    if (filterOptions.isDeleted) {
      result["deleted"] = true;
    }

    return result;
  }

  getURL(): string {
    return `${API_ROOT}/admin/user?page=1&count=1&sort=r`;
  }

  async select(pageOptions: PageOptions<SortItem>, searchOptions: SearchOptions, filterOptions: FilterOptions): Promise<[User[], number]> {
    const offset = (pageOptions.page - 1) * pageOptions.count;
    const sort: OrderItem = createSortOptions<SortItem>(pageOptions.sort, userSortOptions);
    const where: WhereOptions = this.createWhere(searchOptions, filterOptions);

    const { rows, count }: { rows: User[]; count: number } = await User.findAndCountAll({
      offset: offset,
      limit: pageOptions.count,
      order: [sort],
      where
    });

    return [rows, count];
  }

  async selectWithUserRole(userId: number): Promise<User | null> {
    const user: User | null = await User.findOne({
      where: {
        userId
      },
      include: {
        model: UserRole,
        as: "userRole"
      }
    });

    return user;
  }

  async selectWithCouple(userId: number): Promise<User | null> {
    const user: User | null = await User.findOne({
      where: { userId: userId },
      include: [
        {
          model: Couple,
          as: "couple"
        }
      ]
    });

    return user;
  }

  async selectAllWithAdditional(userIds: number[]): Promise<User[]> {
    const users: User[] = await User.findAll({
      where: { userId: userIds },
      include: [
        {
          model: Couple,
          as: "couple",
          include: [
            {
              model: Calendar,
              as: "calendars"
            },
            {
              model: Album,
              as: "albums",
              include: [
                {
                  model: AlbumImage,
                  as: "albumImages"
                }
              ]
            }
          ]
        }
      ]
    });

    return users;
  }

  async create(transaction: Transaction | null = null, data: CreateUserWithAdmin, profile?: File): Promise<User> {
    let createdUser: User = await User.create(data, { transaction });

    if (profile) {
      const path = this.createProfile(createdUser.userId, profile);

      createdUser = await createdUser.update(
        {
          profile: path,
          profileSize: profile.size,
          profileType: profile.mimetype ? profile.mimetype : UNKNOWN_NAME
        },
        { transaction }
      );

      await uploadFileWithGCP({
        filename: path,
        buffer: profile.buffer,
        mimetype: profile.mimetype,
        size: profile.size
      });
    }

    return createdUser;
  }

  update(transaction: Transaction | null, ...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }

  delete(transaction: Transaction | null, ...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }

  async deleteAll(transaction: Transaction | null, userIds: number[]): Promise<void> {
    await User.destroy({
      where: {
        userId: userIds
      },
      transaction
    });
  }
}

export default UserAdminService;
