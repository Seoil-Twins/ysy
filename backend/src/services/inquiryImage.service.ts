import dayjs from "dayjs";
import { InferAttributes, InferCreationAttributes, Optional, Transaction } from "sequelize";

import logger from "../logger/logger.js";
import { File, UploadImageInfo, uploadFileWithGCP, uploadFilesWithGCP } from "../utils/gcp.util.js";

import { InquiryImage } from "../models/inquiryImage.model.js";

import { Service } from "./service.js";

import { UNKNOWN_NAME } from "../constants/file.constant.js";
import { NullishPropertiesOf } from "sequelize/types/utils";

class InquiryImageService extends Service {
  private FOLDER_NAME = "users";

  private createImageURL(userId: number, inquiryId: number, filename: string): string {
    return `${this.FOLDER_NAME}/${userId}/inquires/${inquiryId}/${dayjs().valueOf()}.${filename}`;
  }

  getURL(...args: any[]): string {
    throw new Error("Method not implemented.");
  }

  select(...args: any[]): Promise<void> {
    throw new Error("Method not implemented.");
  }

  /**
   * 하나의 이미지 정보 추가 및 GCP에 업로드합니다.
   *
   * @param transaction 현재 사용중인 트랜잭션
   * @param inquiryId 문의 내역이 가지는 고유한 아이디
   * @param userId 유저가 가지는 고유한 아이디
   * @param image {@link File}
   * @returns Promise\<{@link InquiryImage}\>
   */
  async create(transaction: Transaction | null = null, inquiryId: number, userId: number, image: File): Promise<InquiryImage> {
    const path = this.createImageURL(userId, inquiryId, image.originalname);
    const createdInquireImage: InquiryImage = await InquiryImage.create(
      {
        inquiryId,
        path,
        size: image.size,
        type: image.mimetype ? image.mimetype : UNKNOWN_NAME
      },
      { transaction }
    );

    await uploadFileWithGCP({
      filename: path,
      buffer: image.buffer,
      mimetype: image.mimetype,
      size: image.size
    });
    logger.debug(`Create inquiry image => ${path}`);

    return createdInquireImage;
  }

  /**
   * 다수의 이미지 정보 추가 및 GCP에 업로드합니다.
   *
   * @param transaction 현재 사용중인 트랜잭션
   * @param inquiryId 문의 내역이 가지는 고유한 아이디
   * @param userId 유저가 가지는 고유한 아이디
   * @param images {@link File File[]}
   * @returns Promise\<{@link InquiryImage InquiryImage[]}\>
   */
  async createMutiple(transaction: Transaction | null = null, inquiryId: number, userId: number, images: File[]): Promise<InquiryImage[]> {
    let createdImages: InquiryImage[] | null = null;
    const dbInfos: Optional<InferAttributes<InquiryImage>, NullishPropertiesOf<InferCreationAttributes<InquiryImage>>>[] = [];
    const imageInfos: UploadImageInfo[] = [];

    images.forEach((image: File) => {
      const path = this.createImageURL(userId, inquiryId, image.originalname);

      dbInfos.push({
        inquiryId,
        path,
        size: image.size,
        type: image.mimetype ? image.mimetype : UNKNOWN_NAME
      });

      imageInfos.push({
        buffer: image.buffer,
        mimetype: image.mimetype,
        filename: path,
        size: image.size
      });
    });

    createdImages = await InquiryImage.bulkCreate(dbInfos, { transaction });

    await uploadFilesWithGCP(imageInfos);

    return createdImages;
  }

  update(transaction: Transaction | null = null, ...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }

  async delete(transaction: Transaction | null = null, ...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }
}

export default InquiryImageService;
