import { Transaction } from "sequelize";

import UploadError from "../errors/upload.error.js";

import sequelize from "../models/index.js";
import { Inquiry } from "../models/inquiry.model.js";

import logger from "../logger/logger.js";
import { DeleteImageInfo, File, deleteFilesWithGCP } from "../utils/gcp.util.js";

import { CreateInquiry, PageOptions, ResponseInquiry } from "../types/inquiry.type.js";

import InquiryService from "../services/inquiry.service.js";
import InquiryImageService from "../services/inquiryImage.service.js";

class InquiryController {
  private inquiryService: InquiryService;
  private inquiryImageService: InquiryImageService;

  constructor(inquiryService: InquiryService, inquiryImageService: InquiryImageService) {
    this.inquiryService = inquiryService;
    this.inquiryImageService = inquiryImageService;
  }

  async getInquires(userId: number, pageOptions: PageOptions): Promise<ResponseInquiry> {
    const inquires: ResponseInquiry = await this.inquiryService.selectForResponse(userId, pageOptions);
    return inquires;
  }

  async addInquire(data: CreateInquiry, images?: File[]): Promise<string> {
    let createdInquiry: Inquiry | null = null;
    let transaction: Transaction | undefined = undefined;

    try {
      transaction = await sequelize.transaction();
      createdInquiry = await this.inquiryService.create(transaction, data);

      if (images && images.length === 1) await this.inquiryImageService.create(transaction, createdInquiry.inquiryId, createdInquiry.userId, images[0]);
      else if (images) await this.inquiryImageService.createMutiple(transaction, createdInquiry.inquiryId, createdInquiry.userId, images);

      await transaction.commit();

      const url: string = this.inquiryService.getURL();
      return url;
    } catch (error) {
      if (transaction) await transaction.rollback();

      if (error instanceof UploadError) {
        const rollbackFiles: DeleteImageInfo[] = error.errors.map((info: DeleteImageInfo) => {
          return {
            ...info,
            location: "inquiry/addInquire"
          };
        });
        deleteFilesWithGCP(rollbackFiles);
      }

      logger.error(`Inquiry create error => ${JSON.stringify(error)}`);
      throw error;
    }
  }
}

export default InquiryController;
