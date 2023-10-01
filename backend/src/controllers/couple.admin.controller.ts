import dayjs from "dayjs";
import { Transaction } from "sequelize";
import randomstring from "randomstring";

import logger from "../logger/logger.js";

import UserService from "../services/user.service.js";
import CoupleService from "../services/couple.service.js";
import CoupleAdminService from "../services/couple.admin.service.js";

import sequelize from "../models/index.js";
import { User } from "../models/user.model.js";
import { Couple } from "../models/couple.model.js";
import { Album } from "../models/album.model.js";

import { FilterOptions, SearchOptions, ResponseCouplesWithAdmin, UpdateCoupleWithAdmin, SortItem, CreateCoupleWithAdmin } from "../types/couple.type.js";

import { UNKNOWN_NAME } from "../constants/file.constant.js";

import { DeleteImageInfo, File, UploadImageInfo, deleteFileWithGCP, deleteFilesWithGCP, getFileBufferWithGCP, uploadFileWithGCP } from "../utils/gcp.util.js";

import NotFoundError from "../errors/notFound.error.js";
import BadRequestError from "../errors/badRequest.error.js";
import ConflictError from "../errors/conflict.error.js";
import { PageOptions } from "../utils/pagination.util.js";

export class CoupleAdminController {
  private ERROR_LOCATION_PREFIX = "adminCouple";

  private userService: UserService;
  private coupleService: CoupleService;
  private coupleAdminService: CoupleAdminService;

  constructor(userService: UserService, coupleService: CoupleService, coupleAdminService: CoupleAdminService) {
    this.userService = userService;
    this.coupleService = coupleService;
    this.coupleAdminService = coupleAdminService;
  }

  /**
   * 커플들의 모든 정보를 필터하여 가져옵니다.
   *
   * @param pageOptions {@link PageOptions}
   * @param searchOptions {@link SearchOptions}
   * @param filterOptions {@link FilterOptions}
   * @returns Promise\<ResponseCouplesWithAdmin\>
   */
  async getCouples(pageOptions: PageOptions<SortItem>, searchOptions: SearchOptions, filterOptions: FilterOptions): Promise<ResponseCouplesWithAdmin> {
    const result: ResponseCouplesWithAdmin = await this.coupleAdminService.select(pageOptions, searchOptions, filterOptions);
    return result;
  }

  /**
   * 커플을 생성합니다.
   * 
   * ```typescript
   *  // 
   *  const data: CreateCoupleWithAdmin = {
        code: "user1의 코드",
        otherCode: "user2의 코드",
        cupDay: "2022-02-13",
        deleted: false                        // true이면 soft delete된 채로 데이터가 추가됩니다.
      };

      // 반환 값은 생성된 couple을 확인할 수 있는 URL입니다.
      // create couple with thumbnail
      const url: string = await coupleAdminController.createCouple(data, thumbnail);

      // create couple
      const url: string = await coupleAdminController.createCouple(data, thumbnail);
   * ```
   * 
   * @param data {@link CreateCoupleWithAdmin}
   * @param thumbnail {@link File} | undefined
   * @returns Promise\<string\>
   */
  async createCouple(data: CreateCoupleWithAdmin, thumbnail?: File): Promise<string> {
    let isNot = true;
    let cupId = "";
    let createdCouple: Couple | null = null;
    let transaction: Transaction | undefined = undefined;
    const user1: User | null = await this.userService.select({ code: data.code });
    const user2: User | null = await this.userService.select({ code: data.otherCode });

    if (!user1 || !user2) throw new BadRequestError("Bad Request");
    else if (user1.cupId || user2.cupId) throw new ConflictError("Duplicated Cup Id");

    try {
      transaction = await sequelize.transaction();

      while (isNot) {
        cupId = randomstring.generate({
          length: 8,
          charset: "alphanumeric"
        });

        const user: User | null = await this.userService.select({ cupId });
        if (!user) isNot = false;
      }

      if (data.deleted) {
        data.deletedTime = dayjs().toDate();
      }

      if (thumbnail) {
        createdCouple = await this.coupleAdminService.createWithThumbnail(transaction, cupId, data, thumbnail);
      } else {
        createdCouple = await this.coupleAdminService.create(transaction, cupId, data);
      }

      await this.userService.updateWithData(transaction, user1, { cupId });
      await this.userService.updateWithData(transaction, user2, { cupId });

      await transaction.commit();
      logger.debug(`Create Data => ${JSON.stringify(data)}`);

      const url: string = this.coupleService.getURL(cupId);
      return url;
    } catch (error) {
      if (transaction) await transaction.rollback();

      if (createdCouple?.thumbnail) {
        await deleteFileWithGCP({
          path: createdCouple.thumbnail,
          location: `${this.ERROR_LOCATION_PREFIX}/createCouple`,
          size: createdCouple.thumbnailSize ? createdCouple.thumbnailSize : 0,
          type: createdCouple.thumbnailType ? createdCouple.thumbnailType : UNKNOWN_NAME
        });
        logger.error(`After updating the gcp, a db error occurred and the gcp thumbnail is deleted => ${createdCouple.thumbnail}`);
      }

      logger.error(`Couple create Error => ${JSON.stringify(error)}`);

      throw error;
    }
  }

  /**
   * 커플의 정보를 수정합니다.
   * 
   * ```typescript
   * const data: UpdateCoupleWithAdmin = {
        cupDay: '2023-09-30',
        deleted: true                       // soft delete
      };

      // 기존 thumbnail을 삭제하고 새로운 thumbnail을 추가합니다.
      const updatedCouple: Couple = await coupleAdminController.updateCouple(cupId, data, thumbnail);
      
      // 기존 thumbnail을 삭제합니다.
      const updatedCouple: Couple = await coupleAdminController.updateCouple(cupId, data, null);

      // 커플의 정보를 수정하고 기존 thumbnail은 변경하지 않습니다.
      const updatedCouple: Couple = await coupleAdminController.updateCouple(cupId, data);
   * ```
   * 
   * @param cupId 커플 아이디
   * @param data {@link UpdateCoupleWithAdmin}
   * @param thumbnail {@link File} | undefined | null
   * @returns Promise\<Couple\>
   */
  async updateCouple(cupId: string, data: UpdateCoupleWithAdmin, thumbnail?: File | null): Promise<Couple> {
    let transaction: Transaction | undefined = undefined;
    let updatedCouple: Couple | null = null;
    let prevFile: UploadImageInfo | null = null;

    const couple: Couple | null = await this.coupleService.select(cupId);
    if (!couple) throw new NotFoundError(`Not found couple with using cupId => ${cupId}`);

    try {
      const prevThumbnailPath: string | null = couple.thumbnail;
      const prevThumbnailSize: number = couple.thumbnailSize ? couple.thumbnailSize : 0;
      const prevThumbnailType: string = couple.thumbnailType ? couple.thumbnailType : UNKNOWN_NAME;
      const prevBuffer = prevThumbnailPath ? await getFileBufferWithGCP(prevThumbnailPath) : null;

      if (prevThumbnailPath && prevBuffer) {
        prevFile = {
          filename: prevThumbnailPath,
          buffer: prevBuffer,
          mimetype: prevThumbnailType,
          size: prevThumbnailSize
        };
      }

      transaction = await sequelize.transaction();

      if (couple.deleted !== data.deleted && data.deleted === false) {
        data.deletedTime = null;
      } else if (couple.deleted !== data.deleted && data.deleted === true) {
        data.deletedTime = dayjs().toDate();
      }

      if (thumbnail) {
        updatedCouple = await this.coupleService.updateWithThumbnail(transaction, couple, data, thumbnail);
      } else if (thumbnail === null) {
        updatedCouple = await this.coupleService.update(transaction, couple, {
          ...data,
          thumbnail: null,
          thumbnailSize: null,
          thumbnailType: null
        });
      } else {
        updatedCouple = await this.coupleService.update(transaction, couple, data);
      }

      if (prevThumbnailPath && (thumbnail || thumbnail === null)) {
        await deleteFileWithGCP({
          path: prevThumbnailPath,
          location: `${this.ERROR_LOCATION_PREFIX}/updateCouple`,
          size: prevThumbnailSize!,
          type: prevThumbnailType!
        });
      }

      await transaction.commit();

      return updatedCouple;
    } catch (error) {
      if (transaction) await transaction.rollback();

      if (updatedCouple?.thumbnail) {
        await deleteFileWithGCP({
          path: updatedCouple.thumbnail,
          location: `${this.ERROR_LOCATION_PREFIX}/updateCouple`,
          size: updatedCouple.thumbnailSize ? updatedCouple.thumbnailSize : 0,
          type: updatedCouple.thumbnailType ? updatedCouple.thumbnailType : UNKNOWN_NAME
        });

        if (prevFile) {
          try {
            await uploadFileWithGCP({
              filename: prevFile.filename,
              buffer: prevFile.buffer,
              mimetype: prevFile.mimetype,
              size: prevFile.size
            });

            logger.error(`After updating the gcp, a db error occurred and the gcp thumbnail is reuploaded => ${updatedCouple.thumbnail}`);
          } catch (error) {
            logger.error(`Previous thumbnail upload error : ${JSON.stringify(error)}`);
          }
        }

        logger.error(`After updating the gcp, a db error occurred and the gcp thumbnail is deleted => ${updatedCouple.thumbnail}`);
      }

      logger.error(`User update error => ${JSON.stringify(error)}`);

      throw error;
    }
  }

  /**
   * 다수의 커플 정보와 해당하는 앨범 정보를 삭제합니다.
   *
   * @param cupIds 커플 아이디 리스트
   */
  async deleteCouples(cupIds: string[]): Promise<void> {
    const deleteFiles: DeleteImageInfo[] = [];
    const couples: Couple[] = await this.coupleAdminService.selectAllWithAdditional(cupIds);
    if (couples.length <= 0) throw new NotFoundError(`Not found couples with using ${cupIds}`);

    let transaction: Transaction | undefined = undefined;

    try {
      transaction = await sequelize.transaction();

      for (const couple of couples) {
        if (couple.thumbnail) {
          deleteFiles.push({
            location: `${this.ERROR_LOCATION_PREFIX}/deleteCouples`,
            path: couple.thumbnail,
            size: couple.thumbnailSize!,
            type: couple.thumbnailType!
          });
        }

        const albums: Album[] | undefined = couple.albums;

        if (albums && albums.length > 0) {
          for (const album of albums) {
            if (album.thumbnail) {
              deleteFiles.push({
                location: `${this.ERROR_LOCATION_PREFIX}/deleteCouples`,
                path: album.thumbnail,
                size: album.thumbnailSize!,
                type: album.thumbnailType!
              });
            }

            if (album.albumImages) {
              for (const image of album.albumImages) {
                deleteFiles.push({
                  location: `${this.ERROR_LOCATION_PREFIX}/deleteCouples`,
                  path: image.path,
                  size: image.size,
                  type: image.type
                });
              }
            }
          }
        }
      }

      await this.coupleAdminService.deleteAll(transaction, cupIds);
      await transaction.commit();

      deleteFilesWithGCP(deleteFiles);
    } catch (error) {
      logger.error(`Couple deletes error in couple admin api => ${JSON.stringify(error)}`);

      if (transaction) await transaction.rollback();
      throw error;
    }
  }
}

export default CoupleAdminController;
