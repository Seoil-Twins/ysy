import { File } from "formidable";
import { Transaction } from "sequelize";
import randomstring from "randomstring";

import logger from "../logger/logger";
import { deleteFile, deleteFiles, deleteFolder } from "../utils/firebase.util";

import UserService from "../services/user.service";
import CoupleService from "../services/couple.service";
import CoupleAdminService from "../services/couple.admin.service";
import AlbumService from "../services/album.service";

import sequelize from "../models";
import { User } from "../models/user.model";
import { Couple, FilterOptions, ICoupleResponseWithCount, IRequestCreate, IUpdateWithAdmin, PageOptions, SearchOptions } from "../models/couple.model";
import { Album } from "../models/album.model";

import NotFoundError from "../errors/notFound.error";
import BadRequestError from "../errors/badRequest.error";
import ConflictError from "../errors/conflict.error";

export class CoupleAdminController {
  private userService: UserService;
  private coupleService: CoupleService;
  private coupleAdminService: CoupleAdminService;
  private albumService: AlbumService;

  constructor(userService: UserService, coupleService: CoupleService, coupleAdminService: CoupleAdminService, albumService: AlbumService) {
    this.userService = userService;
    this.coupleService = coupleService;
    this.coupleAdminService = coupleAdminService;
    this.albumService = albumService;
  }

  /**
   * Admin API 전용이며 Pagination, Sort, Search 등을 사용하여 검색할 수 있습니다.
   *
   * ```typescript
   * const pageOptions: PageOptions = {
   *      count: 10,
   *      page: 1,
   *      sort: "r"
   * };
   * const searchOptions: SearchOptions = { name: "용" };
   * const filterOptions: FilterOptions = {
   *      fromDate: "2022-02-25",
   *      toDate: "2022-02-27",
   *      isDeleted: false            // Get only deleted couple.
   * };
   *
   * const result: ICoupleResponseWithCount = await coupleController.getCouplesWithAdmin(pageOptions, searchOptions, filterOptions);
   * ```
   * @param pageOptions {@link PageOptions}
   * @param searchOptions {@link SearchOptions}
   * @param filterOptions {@link FilterOptions}
   * @returns A {@link ICoupleResponseWithCount}
   */
  async getCouples(pageOptions: PageOptions, searchOptions: SearchOptions, filterOptions: FilterOptions): Promise<ICoupleResponseWithCount> {
    let result: ICoupleResponseWithCount = {
      couples: [],
      count: 0
    };

    if (searchOptions.name && searchOptions.name !== "undefined") {
      result = await this.coupleAdminService.selectWithName(pageOptions, searchOptions, filterOptions);
    } else {
      result = await this.coupleAdminService.select(pageOptions, filterOptions);
    }

    return result;
  }

  async createCouple(data: IRequestCreate, file?: File): Promise<string> {
    let isNot = true;
    let cupId = "";
    let createdCouple: Couple | null = null;
    let transaction: Transaction | undefined = undefined;

    try {
      transaction = await sequelize.transaction();

      while (isNot) {
        cupId = randomstring.generate({
          length: 8,
          charset: "alphanumeric"
        });

        const user: User | null = await this.userService.selectWithWhere({ cupId });
        if (!user) isNot = false;
      }

      createdCouple = await this.coupleService.create(transaction, cupId, data, file);
      const user1: User | null = await this.userService.selectWithWhere({ userId: data.userId });
      const user2: User | null = await this.userService.selectWithWhere({ userId: data.userId2 });

      if (!user1 || !user2) throw new BadRequestError("Bad Request");
      else if (user1.cupId || user2.cupId) throw new ConflictError("Duplicated Cup Id");

      await this.userService.update(transaction, user1, {
        cupId: createdCouple.cupId
      });

      await this.userService.update(transaction, user2, {
        cupId: createdCouple.cupId
      });

      await transaction.commit();
      logger.debug(`Create Data => ${JSON.stringify(data)}`);

      const url: string = this.coupleAdminService.getURL(cupId);

      return url;
    } catch (error) {
      if (createdCouple?.thumbnail) {
        deleteFile(createdCouple.thumbnail);
        logger.error(`After updating the firebase, a db error occurred and the firebase thumbnail is deleted => ${createdCouple.thumbnail}`);
      }
      if (transaction) await transaction.rollback();
      logger.error(`Couple create Error => ${JSON.stringify(error)}`);

      throw error;
    }
  }

  async updateCouple(cupId: string, data: IUpdateWithAdmin, thumbnail?: File): Promise<Couple> {
    const couple: Couple | null = await this.coupleService.selectByPk(cupId);
    if (!couple) throw new BadRequestError();

    const prevThumbnail: string | null = couple?.thumbnail;

    let transaction: Transaction | undefined = undefined;
    let createdCouple: Couple | null = null;

    try {
      transaction = await sequelize.transaction();

      if (thumbnail) {
        createdCouple = await this.coupleAdminService.updateWithFile(transaction, couple, data, thumbnail);
      } else {
        createdCouple = await this.coupleAdminService.update(transaction, couple, data);
      }

      await transaction.commit();
      if (thumbnail && prevThumbnail) {
        await deleteFile(prevThumbnail);
        logger.debug(`Deleted Previous thumbnail => ${prevThumbnail}`);
      }

      return createdCouple;
    } catch (error) {
      if (createdCouple?.thumbnail) await deleteFile(createdCouple.thumbnail);
      if (transaction) await transaction.rollback();

      logger.error(`Couple update error in couple admin api => ${JSON.stringify(error)}`);
      throw error;
    }
  }

  async deleteCouples(coupleIds: string[]): Promise<void> {
    const couples: Couple[] = await this.coupleAdminService.selectAllWithAdditional(coupleIds);
    if (couples.length === 0) throw new NotFoundError(`Not found couples with using ${coupleIds}`);

    let transaction: Transaction | undefined = undefined;

    try {
      transaction = await sequelize.transaction();
      const thumbnailPaths: string[] = [];
      const folderPaths: string[] = [];

      for (const couple of couples) {
        if (couple.thumbnail) thumbnailPaths.push(couple.thumbnail);

        const albums: Album[] | undefined = couple.albums;

        if (albums) {
          for (const album of albums) {
            if (album.thumbnail) thumbnailPaths.push(album.thumbnail);
            folderPaths.push(this.albumService.getAlbumFolderPath(album.cupId, album.albumId));
          }
        }

        await this.coupleAdminService.delete(transaction, couple);
      }

      await transaction.commit();
      await deleteFiles(thumbnailPaths);
      for (const path of folderPaths) {
        await deleteFolder(path);
      }
    } catch (error) {
      if (transaction) await transaction.rollback();

      logger.error(`Couple deletes error in couple admin api => ${JSON.stringify(error)}`);
      throw error;
    }
  }
}

export default CoupleAdminController;
