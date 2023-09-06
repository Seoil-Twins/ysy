import dayjs from "dayjs";
import { File } from "formidable";
import { InferCreationAttributes, Optional, OrderItem, Transaction } from "sequelize";
import { UploadResult } from "firebase/storage";
import { NullishPropertiesOf } from "sequelize/types/utils";

import { UNKNOWN_NAME } from "../constants/file.constant";

import logger from "../logger/logger";
import { Image, uploadFile, uploadFiles } from "../utils/firebase.util";
import { createSortOptions } from "../utils/sort.util";

import { PageOptions } from "../types/album.type";

import { AlbumImage } from "../models/albumImage.model";

import { Service } from "./service";

import UploadError from "../errors/upload.error";

class AlbumImageService extends Service {
  private FOLDER_NAME = "couples";

  getURL(...args: any[]): string {
    throw new Error("Method not implemented.");
  }

  select(...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }

  private createImageURL(cupId: string, albumId: number, filename: string) {
    return `${this.FOLDER_NAME}/${cupId}/${albumId}/${dayjs().valueOf()}_${filename}`;
  }

  async selectAllWithIds(imageIds: number[]): Promise<AlbumImage[]> {
    const images: AlbumImage[] = await AlbumImage.findAll({ where: { albumImageId: imageIds } });
    return images;
  }

  async selectAllWithOptions(albumId: number, pageOptions: PageOptions): Promise<{ images: AlbumImage[]; total: number }> {
    const offset: number = (pageOptions.page - 1) * pageOptions.count;
    const sortOptions: OrderItem = createSortOptions(pageOptions.sort);

    const { rows, count }: { rows: AlbumImage[]; count: number } = await AlbumImage.findAndCountAll({
      where: { albumId },
      attributes: { exclude: ["albumId"] },
      offset,
      limit: pageOptions.count,
      order: [sortOptions]
    });

    return { images: rows, total: count };
  }

  async create(transaction: Transaction | null, cupId: string, albumId: number, image: File): Promise<AlbumImage> {
    const path = this.createImageURL(cupId, albumId, image.originalFilename!);
    const createdImage: AlbumImage = await AlbumImage.create(
      {
        albumId,
        path,
        size: image.size,
        type: image.mimetype ? image.mimetype : UNKNOWN_NAME
      },
      { transaction }
    );

    await uploadFile(path, image.filepath);
    logger.debug(`Create album image => ${path}`);

    return createdImage;
  }

  async createMutiple(transaction: Transaction | null, cupId: string, albumId: number, images: File[]): Promise<AlbumImage[]> {
    const filePaths: string[] = images.map((image: File) => image.filepath);
    const imagePaths: string[] = images.map((image: File) => this.createImageURL(cupId, albumId, image.originalFilename!));
    let createdImages: AlbumImage[] = [];

    const [successResults, failedResults]: [UploadResult[], PromiseSettledResult<any>[]] = await uploadFiles(filePaths, imagePaths);

    failedResults.forEach((failed) => {
      logger.error(`Add album error and ignore => ${JSON.stringify(failed)}`);
    });

    const mappedRecords: readonly Optional<InferCreationAttributes<AlbumImage>, NullishPropertiesOf<InferCreationAttributes<AlbumImage>>>[] =
      successResults.map((value) => {
        const regex = /(\d+)_(.+)/;
        const matched: RegExpMatchArray | null = value.metadata.name.match(regex);
        const result = matched ? matched[2] : null;
        const finedImg = images.find((img) => img.originalFilename === result);

        return {
          albumId,
          path: value.metadata.fullPath,
          size: Number(value.metadata.size),
          type: finedImg?.mimetype || UNKNOWN_NAME
        };
      });

    try {
      createdImages = await AlbumImage.bulkCreate(mappedRecords, { transaction });
    } catch (error) {
      const failedRecords: Image[] = mappedRecords.map((value) => {
        return {
          size: value.size,
          type: value.type,
          path: value.path,
          location: `albumImage/createMultiple`
        };
      });

      throw new UploadError(failedRecords, "Album image error");
    }

    return createdImages;
  }

  update(_transaction: Transaction | null): Promise<any> {
    throw new Error("Method not implemented.");
  }

  async delete(transaction: Transaction | null, imageIds: number[]): Promise<any> {
    await AlbumImage.destroy({ where: { albumImageId: imageIds }, transaction });
  }
}

export default AlbumImageService;
