import { File } from "formidable";
import { Transaction } from "sequelize";

import { UNKNOWN_NAME } from "../constants/file.constant";

import ForbiddenError from "../errors/forbidden.error";
import NotFoundError from "../errors/notFound.error";
import UploadError from "../errors/upload.error";

import sequelize from "../models";
import { Album } from "../models/album.model";
import { AlbumImage } from "../models/albumImage.model";

import { PageOptions, ResponseAlbum, ResponseAlbumFolder } from "../types/album.type";

import logger from "../logger/logger";
import AlbumService from "../services/album.service";
import AlbumImageService from "../services/albumImage.service";

import { Image, deleteFile, deleteFiles } from "../utils/firebase.util";

class AlbumController {
  private ERROR_LOCATION_PREFIX = "album";
  private albumService: AlbumService;
  private albumImageService: AlbumImageService;

  constructor(albumService: AlbumService, albumImageService: AlbumImageService) {
    this.albumService = albumService;
    this.albumImageService = albumImageService;
  }

  async getAlbumsFolder(cupId: string, options: PageOptions): Promise<ResponseAlbumFolder> {
    const { albums, total }: { albums: Album[]; total: number } = await this.albumService.selectAllForFolder(cupId, options);
    const response: ResponseAlbumFolder = { albums, total };

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

  async addImages(cupId: string, albumId: number, images: File | File[]): Promise<string> {
    let albumImages: AlbumImage | AlbumImage[] | null = null;
    const albumFolder: Album | null = await this.albumService.select(albumId);
    if (!albumFolder) throw new NotFoundError("Not found album using query parameter album ID");
    else if (albumFolder.cupId !== cupId) throw new ForbiddenError("The ID of the album folder and the body ID don't match.");

    let transaction: Transaction | undefined = undefined;

    try {
      transaction = await sequelize.transaction();

      if (Array.isArray(images)) albumImages = await this.albumImageService.createMutiple(transaction, cupId, albumId, images);
      else if (images instanceof File) albumImages = await this.albumImageService.create(transaction, cupId, albumId, images);

      await transaction.commit();
      logger.debug(`Success add albums => ${cupId} | ${albumId} | ${JSON.stringify(images)}`);

      const url: string = this.albumService.getAlbumUrl(cupId, albumId);
      return url;
    } catch (error) {
      if (transaction) await transaction.rollback();

      if (albumImages && albumImages instanceof AlbumImage) {
        await deleteFile({
          path: albumImages.path,
          location: `${this.ERROR_LOCATION_PREFIX}/addImages`,
          size: albumImages.size,
          type: albumImages.type
        });
        logger.error(`After updating the firebase, a db error occurred and the firebase thumbnail is deleted => ${albumImages.path}`);
      } else if (albumImages && Array.isArray(images)) {
        const deleteParam: Image[] = [];

        albumImages.forEach((image: AlbumImage) => {
          deleteParam.push({
            path: image.path,
            location: `${this.ERROR_LOCATION_PREFIX}/addImages`,
            size: image.size,
            type: image.type
          });
        });

        await deleteFiles(deleteParam);
        logger.error(`After updating the firebase, a db error occurred and the firebase thumbnail is deleted => ${JSON.stringify(albumImages)}`);
      }

      if (error instanceof UploadError) {
        await deleteFiles(error.errors);
      }

      logger.error(`Album Create Error ${JSON.stringify(error)}`);
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

  async updateThumbnail(albumId: number, cupId: string, thumbnail: File | null): Promise<Album> {
    let updatedAlbum: Album | null = null;
    const albumFolder: Album | null = await this.albumService.select(albumId);
    if (!albumFolder) throw new NotFoundError("Not found album using query parameter album ID");
    else if (albumFolder.cupId !== cupId) throw new ForbiddenError("The ID of the album folder and the body ID don't match.");

    let transaction: Transaction | undefined = undefined;

    try {
      const prevAlbumPath: string | null = albumFolder.thumbnail;
      const prevAlbumSize: number = albumFolder.thumbnailSize ? albumFolder.thumbnailSize : 0;
      const prevAlbumType: string = albumFolder.thumbnailType ? albumFolder.thumbnailType : UNKNOWN_NAME;

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

      await transaction.commit();

      if (prevAlbumPath) {
        await deleteFile({
          path: prevAlbumPath,
          location: `${this.ERROR_LOCATION_PREFIX}/updateThumbnail`,
          size: prevAlbumSize!,
          type: prevAlbumType!
        });
      }
      logger.debug(`Update Data => ${JSON.stringify(updatedAlbum)}`);

      return updatedAlbum!;
    } catch (error) {
      if (transaction) await transaction.rollback();

      if (updatedAlbum?.thumbnail) {
        await deleteFile({
          path: updatedAlbum.thumbnail,
          location: `${this.ERROR_LOCATION_PREFIX}/updateThumbnail`,
          size: updatedAlbum.thumbnailSize ? updatedAlbum.thumbnailSize : 0,
          type: updatedAlbum.thumbnailType ? updatedAlbum.thumbnailType : UNKNOWN_NAME
        });

        logger.error(`After updating the firebase, a db error occurred and the firebase thumbnail is deleted => ${updatedAlbum.thumbnail}`);
      }

      logger.error(`Album update thumbnail error => ${JSON.stringify(error)}`);
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

      if (albumFolder.thumbnail) {
        const splitedPath = albumFolder.thumbnail.split(".");
        const mimetype = splitedPath[splitedPath.length - 1];

        await deleteFile({
          path: albumFolder.thumbnail,
          location: `${this.ERROR_LOCATION_PREFIX}/deletedAlbum`,
          size: 0,
          type: mimetype
        });
      }

      const images: Image[] | undefined = albumFolder.albumImages?.map((image: AlbumImage) => {
        return {
          path: image.path,
          size: image.size ? image.size : 0,
          type: image.type ? image.type : UNKNOWN_NAME,
          location: `${this.ERROR_LOCATION_PREFIX}/deleteAlbum`
        };
      });

      if (images) {
        await deleteFiles(images);
      }

      logger.debug(`Success Deleted albums => ${cupId}, ${albumId}`);
    } catch (error) {
      if (transaction) await transaction.rollback();

      logger.error(`Delete album error => ${JSON.stringify(error)}`);
      throw error;
    }
  }

  async deleteAlbumImages(cupId: string, albumId: number, imageIds: number[]): Promise<void> {
    const albumFolder: Album | null = await this.albumService.select(albumId);
    if (!albumFolder) throw new NotFoundError("Not found album using query parameter album ID");
    else if (albumFolder.cupId !== cupId) throw new ForbiddenError("The ID of the album folder and the body ID don't match.");

    const images: AlbumImage[] = await this.albumImageService.selectAllWithIds(imageIds);
    if (!images.length || images.length <= 0) throw new NotFoundError("Not found images");

    const imagesOfParam: Image[] = images.map((image: AlbumImage) => {
      return {
        path: image.path,
        location: `${this.ERROR_LOCATION_PREFIX}/deleteAlbumImages`,
        size: image.size,
        type: image.type
      };
    });

    let transaction: Transaction | undefined = undefined;

    try {
      transaction = await sequelize.transaction();

      await this.albumImageService.delete(transaction, imageIds);
      await transaction.commit();

      await deleteFiles(imagesOfParam);
    } catch (error) {
      logger.error(`Delete album error => ${JSON.stringify(error)}`);
      if (transaction) await transaction.rollback();

      throw error;
    }
  }
}

export default AlbumController;
