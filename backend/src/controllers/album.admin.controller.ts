import { Transaction } from "sequelize";

import NotFoundError from "../errors/notFound.error.js";

import sequelize from "../models/index.js";
import { Album } from "../models/album.model.js";
import { ResponseAlbumFolder, ResponseAlbum, SearchOptions, FilterOptions, SortItem } from "../types/album.type.js";
import { AlbumImage } from "../models/albumImage.model.js";

import logger from "../logger/logger.js";

import AlbumAdminService from "../services/album.admin.service.js";
import AlbumService from "../services/album.service.js";
import AlbumImageService from "../services/albumImage.service.js";
import { PageOptions } from "../utils/pagination.util.js";
import { DeleteImageInfo, File, UploadImageInfo, deleteFileWithGCP, deleteFilesWithGCP, getFileBufferWithGCP, uploadFileWithGCP } from "../utils/gcp.util.js";
import { Couple } from "../models/couple.model.js";
import CoupleService from "../services/couple.service.js";
import { UNKNOWN_NAME } from "../constants/file.constant.js";
import UploadError from "../errors/upload.error.js";

class AlbumAdminController {
  private ERROR_LOCATION_PREFIX = "adminAlbum";

  private albumService: AlbumService;
  private albumAdminService: AlbumAdminService;
  private albumImageService: AlbumImageService;
  private coupleService: CoupleService;

  constructor(albumService: AlbumService, albumAdminService: AlbumAdminService, albumImageService: AlbumImageService, coupleService: CoupleService) {
    this.albumService = albumService;
    this.albumAdminService = albumAdminService;
    this.albumImageService = albumImageService;
    this.coupleService = coupleService;
  }

  /**
   * 모든 Album Folder를 가져옵니다.
   * ```typescript
   * const pageOptions: PageOptions = {
   *      count: 10,
   *      page: 1,
   *      sort: "r" | "o" | "cd" | "ca"
   * };
   * const searchOptions: SearchOptions = {
   *      cupId: "AAABBB"
   * };
   * const filterOptions: FilterOptions = {
   *      fromDate: "2023-03-01",
   *      toDate: "2023-03-03"
   * };
   *
   * const result: IAlbumResponseWithCount = await albumAdminController.getAlbumFolders(pageOptions, searchOptions, filterOptions);
   * ```
   * @param pageOptions {@link PageOptions}
   * @param searchOptions {@link SearchOptions}
   * @param filterOptions {@link FilterOptions}
   * @returns A {@link IAlbumResponseWithCount}
   */
  async getAlbumFolders(pageOptions: PageOptions<SortItem>, searchOptions: SearchOptions, filterOptions: FilterOptions): Promise<ResponseAlbumFolder> {
    const { albums, total }: { albums: Album[]; total: number } = await this.albumAdminService.select(pageOptions, searchOptions, filterOptions);
    const result: ResponseAlbumFolder = {
      albums,
      total
    };

    return result;
  }

  async getAlbum(albumId: number, options: PageOptions<SortItem>): Promise<ResponseAlbum> {
    const album: Album | null = await this.albumService.select(albumId);
    if (!album) throw new NotFoundError("Not Found Albums");

    const { images, total }: { images: AlbumImage[]; total: number } = await this.albumImageService.selectAllWithOptions(albumId, options);

    const result: ResponseAlbum = {
      ...album.dataValues,
      images,
      total
    };

    return result;
  }

  async addAlbum(cupId: string, title: string, thumbnail?: File, images?: File[]): Promise<string> {
    let createdAlbum: Album | null = null;
    let createdAlbumImages: AlbumImage[] | null = null;
    let transaction: Transaction | undefined = undefined;

    const couple: Couple | null = await this.coupleService.select(cupId);
    if (!couple) throw new NotFoundError(`Not found couple with using cupId => ${cupId}`);

    try {
      transaction = await sequelize.transaction();

      if (thumbnail) {
        createdAlbum = await this.albumAdminService.createWithThumbnail(transaction, cupId, title, thumbnail);
      } else {
        createdAlbum = await this.albumAdminService.create(transaction, cupId, title);
      }

      if (images && images.length === 1) {
        createdAlbumImages = [await this.albumImageService.create(transaction, cupId, createdAlbum.albumId, images[0])];
      } else if (images && images.length > 1) {
        createdAlbumImages = await this.albumImageService.createMutiple(transaction, cupId, createdAlbum.albumId, images);
      }

      await transaction.commit();

      const url: string = this.albumAdminService.getURL(cupId);
      return url;
    } catch (error) {
      if (transaction) await transaction.rollback();

      if (createdAlbum?.thumbnail) {
        await deleteFileWithGCP({
          path: createdAlbum.thumbnail,
          location: `${this.ERROR_LOCATION_PREFIX}/createAlbum`,
          size: createdAlbum.thumbnailSize ? createdAlbum.thumbnailSize : 0,
          type: createdAlbum.thumbnailType ? createdAlbum.thumbnailType : UNKNOWN_NAME
        });
        logger.error(`After updating the gcp, a db error occurred and the gcp thumbnail is deleted => ${createdAlbum.thumbnail}`);
      }

      if (createdAlbumImages) {
        const rollbackFiles: DeleteImageInfo[] = [];
        createdAlbumImages.forEach((image: AlbumImage) => {
          rollbackFiles.push({
            path: image.path,
            size: image.size,
            type: image.type,
            location: `${this.ERROR_LOCATION_PREFIX}/createAlbum`
          });
        });

        deleteFilesWithGCP(rollbackFiles);
      }

      if (error instanceof UploadError) {
        const rollbackFiles: DeleteImageInfo[] = error.errors.map((info: DeleteImageInfo) => {
          return {
            ...info,
            location: `${this.ERROR_LOCATION_PREFIX}/createAlbum`
          };
        });

        deleteFilesWithGCP(rollbackFiles);
      }

      logger.error(`Album create Error => ${JSON.stringify(error)}`);
      throw error;
    }
  }

  // async addImages(albumId: number, images: File | File[]): Promise<string> {
  //   let albumImages: AlbumImage | AlbumImage[] | null = null;
  //   const album: Album | null = await this.albumService.select(albumId);
  //   if (!album) throw new NotFoundError("Not found album using query parameter album ID");

  //   let transaction: Transaction | undefined = undefined;

  //   try {
  //     transaction = await sequelize.transaction();

  //     if (images instanceof Array<File>) albumImages = await this.albumImageService.createMutiple(transaction, album.cupId, albumId, images);
  //     else if (images instanceof File) albumImages = await this.albumImageService.create(transaction, album.cupId, albumId, images);

  //     await transaction.commit();
  //     logger.debug(`Success add albums => ${album.cupId} | ${albumId} | ${JSON.stringify(images)}`);

  //     const url: string = this.albumAdminService.getURL(album.cupId);
  //     return url;
  //   } catch (error) {
  //     if (albumImages && albumImages instanceof AlbumImage) {
  //       await deleteFile(albumImages.image);
  //       logger.error(`After updating the firebase, a db error occurred and the firebase thumbnail is deleted => ${albumImages.image}`);
  //     } else if (albumImages && albumImages instanceof Array<AlbumImage>) {
  //       const paths: string[] = [];
  //       albumImages.forEach((image: AlbumImage) => {
  //         paths.push(image.image);
  //       });

  //       await deleteFiles(paths);
  //       logger.error(`After updating the firebase, a db error occurred and the firebase thumbnail is deleted => ${JSON.stringify(albumImages)}`);
  //     }

  //     if (transaction) await transaction.rollback();
  //     logger.error(`Album Create Error ${JSON.stringify(error)}`);
  //     throw error;
  //   }
  // }

  async updateAlbum(cupId: string, albumId: number, title: string, thumbnail?: File | null): Promise<Album> {
    let transaction: Transaction | undefined = undefined;
    let updatedAlbum: Album | null = null;
    let prevFile: UploadImageInfo | null = null;

    const albumFolder = await this.albumService.select(albumId);
    if (!albumFolder) throw new NotFoundError("Not found album using query parameter album ID");

    try {
      const prevAlbumPath: string | null = albumFolder.thumbnail;
      const prevAlbumSize: number = albumFolder.thumbnailSize ? albumFolder.thumbnailSize : 0;
      const prevAlbumType: string = albumFolder.thumbnailType ? albumFolder.thumbnailType : UNKNOWN_NAME;
      const prevBuffer = prevAlbumPath ? await getFileBufferWithGCP(prevAlbumPath) : null;

      if (prevAlbumPath && prevBuffer) {
        prevFile = {
          filename: prevAlbumPath,
          buffer: prevBuffer,
          mimetype: prevAlbumType,
          size: prevAlbumSize
        };
      }

      transaction = await sequelize.transaction();

      if (thumbnail) {
        updatedAlbum = await this.albumAdminService.updateWithThumbnail(transaction, albumFolder, { title }, thumbnail);
      } else if (thumbnail === null) {
        updatedAlbum = await this.albumAdminService.update(transaction, albumFolder, {
          thumbnail: null,
          thumbnailSize: null,
          thumbnailType: null
        });
      } else {
        updatedAlbum = await this.albumAdminService.update(transaction, albumFolder, {
          title
        });
      }

      if (prevAlbumPath) {
        await deleteFileWithGCP({
          path: prevAlbumPath,
          location: `${this.ERROR_LOCATION_PREFIX}/updateThumbnail`,
          size: prevAlbumSize!,
          type: prevAlbumType!
        });
      }

      await transaction.commit();
      return updatedAlbum!;
    } catch (error) {
      logger.error(`Album update thumbnail error => ${JSON.stringify(error)}`);

      if (transaction) await transaction.rollback();

      if (updatedAlbum?.thumbnail) {
        await deleteFileWithGCP({
          path: updatedAlbum.thumbnail,
          location: `${this.ERROR_LOCATION_PREFIX}/updateThumbnail`,
          size: updatedAlbum.thumbnailSize ? updatedAlbum.thumbnailSize : 0,
          type: updatedAlbum.thumbnailType ? updatedAlbum.thumbnailType : UNKNOWN_NAME
        });

        try {
          if (prevFile) {
            await uploadFileWithGCP({
              filename: prevFile.filename,
              buffer: prevFile.buffer,
              mimetype: prevFile.mimetype,
              size: prevFile.size
            });
          }
        } catch (error) {
          logger.error(`Previous thumbnail upload error : ${JSON.stringify(error)}`);
        }

        logger.error(`After updating the gcp, a db error occurred and the gcp thumbnail is deleted => ${updatedAlbum.thumbnail}`);
      }

      throw error;
    }
  }

  async deleteAlbums(albumIds: number[]): Promise<void> {
    let transaction: Transaction | undefined = undefined;

    const deleteFiles: DeleteImageInfo[] = [];
    const albumFolders: Album[] = await this.albumAdminService.selectAll(albumIds);

    if (!albumFolders) throw new NotFoundError("Not found album using query parameter album ID");

    try {
      transaction = await sequelize.transaction();

      for (const album of albumFolders) {
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

      await this.albumAdminService.deleteAll(transaction, albumIds);
      await transaction.commit();

      deleteFilesWithGCP(deleteFiles);
    } catch (error) {
      logger.error(`Album deletes error in album admin api => ${JSON.stringify(error)}`);

      if (transaction) await transaction.rollback();
      throw error;
    }
  }

  // async deleteAlbumImages(imageIds: number[]): Promise<void> {
  //   const images: AlbumImage[] = await this.albumImageService.select(imageIds);
  //   if (!images.length || images.length <= 0) throw new NotFoundError("Not found images");
  //   let transaction: Transaction | undefined = undefined;

  //   try {
  //     transaction = await sequelize.transaction();

  //     const paths = images.map((image: AlbumImage) => {
  //       return image.image;
  //     });

  //     await this.albumImageService.delete(transaction, imageIds);
  //     await transaction.commit();

  //     await deleteFiles(paths);
  //   } catch (error) {
  //     logger.error(`Delete album error => ${JSON.stringify(error)}`);
  //     if (transaction) await transaction.rollback();
  //     throw error;
  //   }
  // }
}

export default AlbumAdminController;
