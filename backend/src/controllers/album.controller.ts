import { Transaction } from "sequelize";

import { UNKNOWN_NAME } from "../constants/file.constant.js";

import ForbiddenError from "../errors/forbidden.error.js";
import NotFoundError from "../errors/notFound.error.js";
import UploadError from "../errors/upload.error.js";

import sequelize from "../models/index.js";
import { Album } from "../models/album.model.js";
import { AlbumImage } from "../models/albumImage.model.js";

import { PageOptions, ResponseAlbum, ResponseAlbumFolder } from "../types/album.type.js";

import logger from "../logger/logger.js";
import AlbumService from "../services/album.service.js";
import AlbumImageService from "../services/albumImage.service.js";

import {
  DeleteImageInfo,
  UploadImageInfo,
  deleteFileWithGCP,
  deleteFilesWithGCP,
  getFileBufferWithGCP,
  moveFilesWithGCP,
  uploadFileWithGCP,
  uploadFilesWithGCP
} from "../utils/gcp.util.js";

class AlbumController {
  private ERROR_LOCATION_PREFIX = "album";
  private albumService: AlbumService;
  private albumImageService: AlbumImageService;

  constructor(albumService: AlbumService, albumImageService: AlbumImageService) {
    this.albumService = albumService;
    this.albumImageService = albumImageService;
  }

  async getAlbumsFolder(cupId: string, options: PageOptions): Promise<ResponseAlbumFolder> {
    const response: ResponseAlbumFolder = await this.albumService.selectAllForFolder(cupId, options);

    if (response.total > 0) {
      for (const album of response.albums) {
        if (album.thumbnail) continue;

        const image: AlbumImage | null = await this.albumImageService.select(album.albumId);

        if (image) {
          album.thumbnail = image.path;
          album.thumbnailSize = image.size;
          album.thumbnailType = image.type;
        }
      }
    }

    return response;
  }

  async getAlbums(albumId: number, options: PageOptions): Promise<ResponseAlbum> {
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

  async addAlbumFolder(cupId: string, title: string): Promise<string> {
    const album: Album = await this.albumService.create(null, cupId, title);
    logger.debug(`Create Data => ${JSON.stringify(album.dataValues)}`);

    const url: string = this.albumService.getFolderUrl(cupId);
    return url;
  }

  async addImages(cupId: string, albumId: number, images: Express.Multer.File[]): Promise<string> {
    const albumFolder: Album | null = await this.albumService.select(albumId);
    if (!albumFolder) throw new NotFoundError("Not found album using query parameter album ID");
    else if (albumFolder.cupId !== cupId) throw new ForbiddenError("The ID of the album folder and the body ID don't match.");

    let transaction: Transaction | undefined = undefined;

    try {
      transaction = await sequelize.transaction();

      if (images.length === 1) await this.albumImageService.create(transaction, cupId, albumId, images[0]);
      else await this.albumImageService.createMutiple(transaction, cupId, albumId, images);

      await transaction.commit();
      const url: string = this.albumService.getAlbumUrl(cupId, albumId);
      return url;
    } catch (error) {
      if (transaction) await transaction.rollback();

      if (error instanceof UploadError) {
        const rollbackFiles: DeleteImageInfo[] = error.errors.map((info: DeleteImageInfo) => {
          return {
            ...info,
            location: "album/addImages"
          };
        });
        deleteFilesWithGCP(rollbackFiles);
      }

      logger.error(`Album Create Error ${JSON.stringify(error)}`);
      throw error;
    }
  }

  async mergeAlbum(cupId: string, albumId: number, targerIds: number[], title: string): Promise<string> {
    let transaction: Transaction | undefined = undefined;
    let movedPaths: string[] = [];
    let updatedAlbumImages: AlbumImage[] = [];
    const prevThumbnails = [];

    const albumFolder: Album | null = await this.albumService.select(albumId);
    if (!albumFolder) throw new NotFoundError("Not found album using albumId");
    else if (albumFolder.cupId !== cupId) throw new ForbiddenError("The ID of the album folder and the body ID don't match.");

    try {
      transaction = await sequelize.transaction();
      await this.albumService.update(transaction, albumFolder, { title });

      const targetAlbums: Album[] = await this.albumService.selectAll({ albumId: targerIds });
      const targetAlbumImages: AlbumImage[] = await this.albumImageService.selectAll({ albumId: targerIds });
      // 딥카피
      const copyAlbumImages: AlbumImage[] = JSON.parse(JSON.stringify(targetAlbumImages));

      updatedAlbumImages = await this.albumImageService.updates(transaction, albumId, targetAlbumImages);
      movedPaths = await moveFilesWithGCP(
        `couples/${cupId}/${albumId}/`,
        copyAlbumImages.map((image: AlbumImage) => image.path)
      );

      for (const targetAlbum of targetAlbums) {
        if (!targetAlbum.thumbnail) continue;

        const buffer: Buffer | null = await getFileBufferWithGCP(targetAlbum.thumbnail);
        if (!buffer) continue;

        prevThumbnails.push({
          path: targetAlbum.thumbnail,
          size: targetAlbum.thumbnailSize!,
          mimetype: targetAlbum.thumbnailType!,
          buffer: buffer
        });
      }

      deleteFilesWithGCP(
        prevThumbnails.map((thumbnail) => {
          return {
            location: "album/mergeAlbum",
            path: thumbnail.path,
            size: thumbnail.size,
            type: thumbnail.mimetype
          };
        })
      );

      await this.albumService.deletes(transaction, targetAlbums);
      await transaction.commit();

      deleteFilesWithGCP(
        copyAlbumImages.map((image: AlbumImage) => {
          return {
            location: "album/mergeAlbum",
            path: image.path,
            size: image.size,
            type: image.type
          };
        })
      );

      const url: string = this.albumService.getAlbumUrl(cupId, albumId);
      return url;
    } catch (error) {
      if (transaction) await transaction.rollback();

      if (movedPaths.length > 0) {
        const finded: DeleteImageInfo[] = movedPaths
          .map((path: string) => {
            const find = updatedAlbumImages.find((image: AlbumImage) => path === image.path);

            if (!find) return null;

            return {
              location: "album/mergeAlbum",
              size: find.size,
              type: find.type,
              path: find.path
            } as DeleteImageInfo;
          })
          .filter((item) => item !== null) as DeleteImageInfo[];

        deleteFilesWithGCP(finded);
      }

      try {
        if (prevThumbnails && movedPaths.length > 0) {
          uploadFilesWithGCP(
            prevThumbnails.map((thumbnail) => {
              return {
                buffer: thumbnail.buffer,
                filename: thumbnail.path,
                mimetype: thumbnail.mimetype,
                size: thumbnail.size
              };
            })
          );
        }
      } catch (error) {
        logger.error(`Previous thumbnail upload error : ${JSON.stringify(error)}`);
      }

      logger.error(`Merge Album Error : ${JSON.stringify(error)}`);

      throw error;
    }
  }

  async updateTitle(albumId: number, cupId: string, title: string): Promise<Album> {
    const albumFolder = await this.albumService.select(albumId);
    if (!albumFolder) throw new NotFoundError("Not found album using query parameter album ID");
    else if (albumFolder.cupId !== cupId) throw new ForbiddenError("The ID of the album folder and the body ID don't match.");

    try {
      const updatedAlbum: Album = await this.albumService.update(null, albumFolder, { title });
      logger.debug(`Album update data => ${JSON.stringify(updatedAlbum)}`);

      return updatedAlbum;
    } catch (error) {
      logger.error(`Album update title error => ${JSON.stringify(error)}`);
      throw error;
    }
  }

  async updateThumbnail(albumId: number, cupId: string, thumbnail: Express.Multer.File | null): Promise<Album> {
    let updatedAlbum: Album | null = null;
    let transaction: Transaction | undefined = undefined;
    let prevFile: UploadImageInfo | null = null;

    const albumFolder: Album | null = await this.albumService.select(albumId);
    if (!albumFolder) throw new NotFoundError("Not found album using query parameter album ID");
    else if (albumFolder.cupId !== cupId) throw new ForbiddenError("The ID of the album folder and the body ID don't match.");

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
        updatedAlbum = await this.albumService.updateWithThumbnail(transaction, albumFolder, thumbnail);
      } else if (thumbnail === null) {
        updatedAlbum = await this.albumService.update(transaction, albumFolder, {
          thumbnail: null,
          thumbnailSize: null,
          thumbnailType: null
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

  async deleteAlbum(cupId: string, albumId: number): Promise<void> {
    const albumFolder: Album | null = await this.albumService.select(albumId, true);
    if (!albumFolder) throw new NotFoundError("Not found album using query parameter album ID");
    else if (albumFolder.cupId !== cupId) throw new ForbiddenError("The ID of the album folder and the body ID don't match.");

    let transaction: Transaction | undefined = undefined;

    try {
      transaction = await sequelize.transaction();

      await this.albumService.delete(transaction, albumFolder);
      await transaction.commit();

      logger.debug(`Success Deleted albums => ${cupId}, ${albumId}`);
    } catch (error) {
      if (transaction) await transaction.rollback();

      logger.error(`Delete album error => ${JSON.stringify(error)}`);
      throw error;
    }

    if (albumFolder.thumbnail) {
      const mimetype = albumFolder.thumbnailType!;

      await deleteFileWithGCP({
        path: albumFolder.thumbnail,
        location: `${this.ERROR_LOCATION_PREFIX}/deletedAlbum`,
        size: 0,
        type: mimetype
      });
    }

    const images: DeleteImageInfo[] | undefined = albumFolder.albumImages?.map((image: AlbumImage) => {
      return {
        path: image.path,
        size: image.size ? image.size : 0,
        type: image.type ? image.type : UNKNOWN_NAME,
        location: `${this.ERROR_LOCATION_PREFIX}/deleteAlbum`
      };
    });

    if (images) {
      deleteFilesWithGCP(images);
    }
  }

  async deleteAlbumImages(cupId: string, albumId: number, imageIds: number[]): Promise<void> {
    let transaction: Transaction | undefined = undefined;

    const albumFolder: Album | null = await this.albumService.select(albumId);
    if (!albumFolder) throw new NotFoundError("Not found album using query parameter album ID");
    else if (albumFolder.cupId !== cupId) throw new ForbiddenError("The ID of the album folder and the body ID don't match.");

    const images: AlbumImage[] = await this.albumImageService.selectAll({ albumImageId: imageIds });
    if (!images.length || images.length <= 0) return;

    const imagesOfParam: DeleteImageInfo[] = images.map((image: AlbumImage) => {
      return {
        path: image.path,
        location: `${this.ERROR_LOCATION_PREFIX}/deleteAlbumImages`,
        size: image.size,
        type: image.type
      };
    });

    try {
      transaction = await sequelize.transaction();

      await this.albumImageService.delete(transaction, imageIds);
      await transaction.commit();
    } catch (error) {
      if (transaction) await transaction.rollback();
      logger.error(`Delete album error => ${JSON.stringify(error)}`);

      throw error;
    }

    deleteFilesWithGCP(imagesOfParam);
  }
}

export default AlbumController;
