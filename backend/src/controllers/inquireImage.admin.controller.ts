import { File } from "formidable";
import { Transaction } from "sequelize";

import sequelize from "../models/index.js";
import { Inquire } from "../models/inquiry.model.js";
import { FilterOptions, InquireImage, InquireImageResponseWithCount, PageOptions, SearchOptions } from "../models/inquiryImage.model.js";

import InquireService from "../services/inquiry.service.js";
import InquireImageAdminService from "../services/inquireImage.admin.service.js";
import InquireImageService from "../services/inquiryImage.service.js";

import UploadError from "../errors/upload.error.js";
import BadRequestError from "../errors/badRequest.error.js";
import NotFoundError from "../errors/notFound.error.js";

import logger from "../logger/logger.js";
import { deleteFile, deleteFiles } from "../utils/firebase.util";

class InquireImageAdminController {
  private inquireService: InquireService;
  private inquireImageService: InquireImageService;
  private inquireImageAdminService: InquireImageAdminService;

  constructor(inquireService: InquireService, inquireImageService: InquireImageService, inquireImageAdminService: InquireImageAdminService) {
    this.inquireService = inquireService;
    this.inquireImageService = inquireImageService;
    this.inquireImageAdminService = inquireImageAdminService;
  }

  async getInquireImages(pageOptions: PageOptions, searchOptions: SearchOptions, filterOptions: FilterOptions): Promise<InquireImageResponseWithCount> {
    const result: InquireImageResponseWithCount = await this.inquireImageAdminService.select(pageOptions, searchOptions, filterOptions);
    if (result.count <= 0) throw new NotFoundError("Not found inquire images");

    return result;
  }

  async addInquireImages(inquireId: number, images: File | File[]): Promise<string> {
    let createdImages: InquireImage | InquireImage[] | undefined = undefined;
    const inquire: Inquire | null = await this.inquireService.select(inquireId);
    if (!inquire) throw new NotFoundError(`Not found inquire with using inquireId => ${inquireId}`);

    const inquireImageCount: number = inquire.inquireImages ? inquire.inquireImages.length : 0;
    const imagesCount: number = images instanceof Array<File> ? images.length : 1;
    if (inquireImageCount + imagesCount > 5) throw new BadRequestError("There are a maximum of 5 inquire images");

    let transaction: Transaction | undefined = undefined;

    try {
      transaction = await sequelize.transaction();

      if (images instanceof Array<File>) {
        createdImages = await this.inquireImageService.createMutiple(transaction, inquireId, inquire.userId, images);
      } else {
        createdImages = await this.inquireImageService.create(transaction, inquireId, inquire.userId, images);
      }

      await transaction.commit();

      const url: string = this.inquireImageAdminService.getURL();
      return url;
    } catch (error) {
      logger.error(`Add inquire images error => ${JSON.stringify(error)}`);

      if (error instanceof UploadError) {
        const paths: string[] = error.paths;
        for (const path of paths) await deleteFile(path);

        logger.error(`After updating the firebase, a db error occurred and the firebase thumbnail is deleted => ${JSON.stringify(paths)}`);
      } else if (createdImages instanceof Array<File>) {
        const paths: string[] = [];
        createdImages.forEach((image: InquireImage) => {
          paths.push(image.image);
        });

        await deleteFiles(paths);
        logger.error(`After updating the firebase, a db error occurred and the firebase thumbnail is deleted => ${JSON.stringify(createdImages)}`);
      } else if (createdImages) {
        await deleteFile(createdImages.image);
        logger.error(`After updating the firebase, a db error occurred and the firebase thumbnail is deleted => ${JSON.stringify(createdImages)}`);
      }

      if (transaction) await transaction.rollback();
      throw error;
    }
  }

  async deleteInquireImages(imageIds: number[]): Promise<void> {
    const inquireImages: InquireImage[] = await this.inquireImageAdminService.selectAll(imageIds);
    if (inquireImages.length <= 0) throw new BadRequestError(`Not found inquire images with using ${imageIds}`);

    await this.inquireImageService.delete(null, imageIds);

    const imagePaths: string[] = inquireImages.map((inquire: InquireImage) => inquire.image);
    await deleteFiles(imagePaths);
  }
}

export default InquireImageAdminController;
