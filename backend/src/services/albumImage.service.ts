import dayjs from "dayjs";
import { InferCreationAttributes, Optional, OrderItem, Transaction, WhereOptions } from "sequelize";
import { NullishPropertiesOf } from "sequelize/types/utils";

import { UNKNOWN_NAME } from "../constants/file.constant";

import logger from "../logger/logger";
import { createSortOptions } from "../utils/sort.util";
import { DeleteImageInfo, File, UploadImageInfo, uploadFileWithGCP, uploadFilesWithGCP } from "../utils/gcp.util";

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

  /**
   * 앨범 이미지가 저장될 경로를 반환합니다.
   * @param cupId 커플이 가지는 고유한 아이디
   * @param albumId 앨범이 가지는 고유한 아이디
   * @param filename 파일 이름
   * @returns string
   */
  private createImageURL(cupId: string, albumId: number, filename: string): string {
    return `${this.FOLDER_NAME}/${cupId}/${albumId}/${dayjs().valueOf()}_${filename}`;
  }

  private createFolderURL(cupId: string, albumId: number) {
    return `${this.FOLDER_NAME}/${cupId}/${albumId}/`;
  }

  /**
   * Where 절을 사용해 검색 후 모든 결과를 반환합니다.
   * @param where {@link WhereOptions}
   * @returns Promise<{@link AlbumImage AlbumImage[]}>
   */
  async selectAll(where: WhereOptions<AlbumImage>): Promise<AlbumImage[]> {
    const images: AlbumImage[] = await AlbumImage.findAll({ where });
    return images;
  }

  /**
   * 페이지네이션을 사용하여 앨범 이미지를 검색하고, 이미지의 총 개수와 검색 결과를 반환합니다.
   *
   * @param albumId 앨범이 가지는 고유한 아이디
   * @param pageOptions {@link PageOptions}
   * @returns Promise<{ images: {@link AlbumImage AlbumImage[]}, total: number }>
   */
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

  /**
   * 단일 이미지 정보를 추가합니다.
   *
   * @param transaction 현재 사용중인 트랜잭션
   * @param cupId 커플 아이디
   * @param albumId 앨범 아이디
   * @param image {@link File}
   * @returns Promise<{@link AlbumImage}>
   */
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

  /**
   * 다중 이미지 정보를 추가합니다.
   *
   * @param transaction 현재 사용중인 트랜잭션
   * @param cupId 커플 아이디
   * @param albumId 앨범 아이디
   * @param image {@link File File[]}
   * @returns Promise<{@link AlbumImage AlbumImage[]}>
   */
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

  /**
   * targetAlbumIds를 통해 모든 앨범 이미지 정보를 가져와 albumId로 변경합니다.
   *
   * @param transaction 현재 사용중인 트랜잭션
   * @param albumId targetAlbumIds를 통해 수정될 값인 앨범 아이디
   * @param targetAlbumIds 수정하고싶은 앨범 아이디
   * @returns number - 쿼리를 통해 업데이트된 행의 개수입니다.
   */
  async updates(transaction: Transaction | null, albumId: number, targetAlbumImages: AlbumImage[]): Promise<AlbumImage[]> {
    const updatedAlbumImages: AlbumImage[] = [];

    for (const albumImage of targetAlbumImages) {
      const changePath = albumImage.path.replace(/\/\d+\//, `/${albumId}/`);

      const updatedAlbumImage = await albumImage.update(
        {
          albumId,
          path: changePath
        },
        { transaction }
      );

      updatedAlbumImages.push(updatedAlbumImage);
    }

    return updatedAlbumImages;
  }

  /**
   * 앨범 이미지 정보들을 삭제합니다.
   *
   * @param transaction 현재 사용중인 트랜잭션
   * @param imageIds 삭제할 앨범 아이디들
   */
  async delete(transaction: Transaction | null, imageIds: number[]): Promise<void> {
    await AlbumImage.destroy({ where: { albumImageId: imageIds }, transaction });
  }
}

export default AlbumImageService;
