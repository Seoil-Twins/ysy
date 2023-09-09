import dayjs from "dayjs";
import { InferCreationAttributes, Optional, OrderItem, Transaction, WhereOptions } from "sequelize";
import { NullishPropertiesOf } from "sequelize/types/utils";
import { File as StorageFile } from "@google-cloud/storage/build/src/file";

import { UNKNOWN_NAME } from "../constants/file.constant";

import logger from "../logger/logger";
import { createSortOptions } from "../utils/sort.util";
import { DeleteImageInfo, File, UploadImageInfo, deleteFilesWithGCP, uploadFileWithGCP, uploadFilesWithGCP } from "../utils/gcp.util";

import { PageOptions } from "../types/album.type";

import { AlbumImage } from "../models/albumImage.model";

import { Service } from "./service";

import UploadError from "../errors/upload.error";

class AlbumImageService extends Service {
  private FOLDER_NAME = "couples";

  getURL(...args: any[]): string {
    throw new Error("Method not implemented.");
  }

  async select(_transaction: Transaction | null): Promise<any> {
    throw new Error("Method not implemented.");
  }

  async selectAll(where: WhereOptions<AlbumImage>): Promise<AlbumImage[]> {
    const images: AlbumImage[] = await AlbumImage.findAll({ where });
    return images;
  }

  private createImageURL(cupId: string, albumId: number, filename: string) {
    return `${this.FOLDER_NAME}/${cupId}/${albumId}/${dayjs().valueOf()}_${filename}`;
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
    const path = this.createImageURL(cupId, albumId, image.originalname);
    const createdImage: AlbumImage = await AlbumImage.create(
      {
        albumId,
        path,
        size: image.size,
        type: image.mimetype ? image.mimetype : UNKNOWN_NAME
      },
      { transaction }
    );

    await uploadFileWithGCP({
      filename: path,
      buffer: image.buffer,
      mimetype: image.mimetype
    });
    logger.debug(`Create album image => ${path}`);

    return createdImage;
  }

  async createMutiple(transaction: Transaction | null, cupId: string, albumId: number, images: File[]): Promise<AlbumImage[]> {
    let createdImages: AlbumImage[] | null = null;
    const dbInfos: Optional<InferCreationAttributes<AlbumImage>, NullishPropertiesOf<InferCreationAttributes<AlbumImage>>>[] = [];
    const imageInfos: UploadImageInfo[] = [];

    images.forEach((image: File) => {
      const path = this.createImageURL(cupId, albumId, image.originalname);

      dbInfos.push({
        albumId,
        path,
        size: image.size,
        type: image.mimetype
      });

      imageInfos.push({
        buffer: image.buffer,
        mimetype: image.mimetype,
        filename: path
      });
    });

    createdImages = await AlbumImage.bulkCreate(dbInfos, { transaction });

    const isSuccess: boolean = await uploadFilesWithGCP(imageInfos);

    if (!isSuccess) {
      const deleteFiles: DeleteImageInfo[] = [];

      createdImages.forEach((image: AlbumImage) => {
        deleteFiles.push({
          location: "albumImage/createMultiple",
          path: image.path,
          size: image.size,
          type: image.type
        });
      });

      throw new UploadError(deleteFiles, "Album Upload Error");
    }

    return createdImages;
  }

  update(_transaction: Transaction | null): Promise<any> {
    throw new Error("Method not implemented.");
  }

  async updates(transaction: Transaction | null, albumId: number, targetAlbumIds: number[]): Promise<number> {
    const isUpdated: [number] = await AlbumImage.update(
      { albumId },
      {
        transaction,
        where: {
          albumId: targetAlbumIds
        }
      }
    );

    console.log("after Updates : ", isUpdated[0]);

    return isUpdated[0];
  }

  async delete(transaction: Transaction | null, imageIds: number[]): Promise<any> {
    await AlbumImage.destroy({ where: { albumImageId: imageIds }, transaction });
  }
}

export default AlbumImageService;
