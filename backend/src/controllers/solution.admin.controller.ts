import { Transaction } from "sequelize";
import { File } from "formidable";

import InquireAdminService from "../services/inquire.admin.service.js";
import SolutionAdminService from "../services/solution.admin.service.js";
import SolutionImageAdminService from "../services/solutionImage.admin.service.js";

import logger from "../logger/logger.js";
import { deleteFile, deleteFiles, deleteFolder } from "../utils/firebase.util";

import sequelize from "../models/index.js";
import { Inquire } from "../models/inquiry.model.js";
import { SolutionImage } from "../models/solutionImage.model.js";
import { FilterOptions, ICreate, ISolutionResponseWithCount, IUpdate, PageOptions, SearchOptions, Solution } from "../models/solution.model.js";

import BadRequestError from "../errors/badRequest.error.js";
import ConflictError from "../errors/conflict.error.js";
import NotFoundError from "../errors/notFound.error.js";
import UploadError from "../errors/upload.error.js";

class SolutionAdminController {
  private solutionAdminService: SolutionAdminService;
  private solutionImageAdminService: SolutionImageAdminService;
  private inquireAdminService: InquireAdminService;

  constructor(solutionAdminService: SolutionAdminService, solutionImageAdminService: SolutionImageAdminService, inquireAdminService: InquireAdminService) {
    this.solutionAdminService = solutionAdminService;
    this.solutionImageAdminService = solutionImageAdminService;
    this.inquireAdminService = inquireAdminService;
  }

  async getSolution(pageOptions: PageOptions, searchOptions: SearchOptions, filterOptions: FilterOptions): Promise<ISolutionResponseWithCount> {
    let result: ISolutionResponseWithCount = {
      solutions: [],
      count: 0
    };

    if (searchOptions.userId) {
      result = await this.solutionAdminService.selectAllWithUserId(pageOptions, searchOptions, filterOptions);
    } else if (searchOptions.username) {
      result = await this.solutionAdminService.selectAllWithUserName(pageOptions, searchOptions, filterOptions);
    } else {
      result = await this.solutionAdminService.selectAll(pageOptions, searchOptions, filterOptions);
    }

    return result;
  }

  async addSolution(inquireId: number, data: ICreate) {
    const inquires: Inquire[] = await this.inquireAdminService.selectByPk([inquireId]);
    if (inquires.length <= 0) throw new BadRequestError(`Not found inquires with using inquireId : ${inquireId}`);

    const solution: Solution | null = await this.solutionAdminService.selectByInId(inquireId);
    if (solution) throw new ConflictError(`This inquiry has a solution => inquire : ${inquireId}`);

    await this.solutionAdminService.create(null, inquireId, data);
    const url: string = this.solutionAdminService.getURL();

    return url;
  }

  async addSolutionWithImages(userId: number, inquireId: number, data: ICreate, images: File | File[]) {
    const inquires: Inquire[] = await this.inquireAdminService.selectByPk([inquireId]);
    if (inquires.length <= 0) throw new BadRequestError(`Not found inquires with using inquireId : ${inquireId}`);

    const solution: Solution | null = await this.solutionAdminService.selectByInId(inquireId);
    if (solution) throw new ConflictError(`This inquiry has a solution => inquire : ${inquireId}`);

    let createdSolution: Solution | null = null;
    let transaction: Transaction | undefined = undefined;

    try {
      transaction = await sequelize.transaction();
      createdSolution = await this.solutionAdminService.create(transaction, inquireId, data);

      if (images instanceof Array<File>) {
        await this.solutionImageAdminService.createMutiple(transaction, createdSolution.solutionId, inquireId, userId, images);
      } else if (images instanceof File) {
        await this.solutionImageAdminService.create(transaction, createdSolution.solutionId, inquireId, userId, images);
      }

      await transaction.commit();
      logger.debug(`Create solution => ${JSON.stringify(createdSolution)}`);

      const url: string = this.solutionAdminService.getURL();
      return url;
    } catch (error) {
      if (createdSolution) await deleteFolder(this.solutionImageAdminService.getFolderPath(userId, inquireId));
      if (transaction) await transaction.rollback();
      logger.error(`Solution create error => ${JSON.stringify(error)}`);

      throw error;
    }
  }

  async updateSolution(userId: number, solutionId: number, data: IUpdate, images?: File | File[]): Promise<Solution> {
    let updatedSolutionImages: SolutionImage | SolutionImage[] | null = null;
    let transaction: Transaction | undefined = undefined;
    const imagePaths: string[] = [];
    const imageIds: number[] = [];

    try {
      const solution: Solution | null = await this.solutionAdminService.select(solutionId);
      if (!solution) throw new NotFoundError("Not Found solution");

      transaction = await sequelize.transaction();

      await this.solutionAdminService.update(transaction, solution, data);

      if (images) {
        solution.solutionImages?.forEach((image: SolutionImage) => {
          imagePaths.push(image.image);
          imageIds.push(image.imageId);
        });

        await this.solutionImageAdminService.delete(transaction, imageIds);

        if (images instanceof Array<File>)
          updatedSolutionImages = await this.solutionImageAdminService.createMutiple(transaction, solutionId, solution.inquireId, userId, images);
        else if (images instanceof File)
          updatedSolutionImages = await this.solutionImageAdminService.create(transaction, solutionId, solution.inquireId, userId, images);
      }

      await transaction.commit();
      await deleteFiles(imagePaths);

      const result: Solution | null = await this.solutionAdminService.select(solutionId);
      return result!;
    } catch (error) {
      // createMultiple에서 N개는 성공하고 하나라도 실패한다면 모든 걸 없애줘야하기 때문에 error 객체에 따로 path 정보를 가지고 있음
      if (error instanceof UploadError) {
        const paths: string[] = error.paths;
        for (const path of paths) await deleteFile(path);

        logger.error(`After updating the firebase, a db error occurred and the firebase thumbnail is deleted => ${JSON.stringify(paths)}`);
      } else if (updatedSolutionImages instanceof SolutionImage) {
        // create or createMultiple은 성공했지만 commit에서 터진다면
        await deleteFile(updatedSolutionImages.image);
        logger.error(`After updating the firebase, a db error occurred and the firebase thumbnail is deleted => ${JSON.stringify(updatedSolutionImages)}`);
      } else if (updatedSolutionImages instanceof Array<SolutionImage>) {
        // create or createMultiple은 성공했지만 commit에서 터진다면
        const paths: string[] = [];
        updatedSolutionImages.forEach((image: SolutionImage) => {
          paths.push(image.image);
        });

        await deleteFiles(paths);
        logger.error(`After updating the firebase, a db error occurred and the firebase thumbnail is deleted => ${JSON.stringify(updatedSolutionImages)}`);
      }

      if (transaction) await transaction.rollback();
      logger.error(`Inquire update error | ${data.inquireId} => ${JSON.stringify(error)}`);

      throw error;
    }
  }

  async deleteSolutions(solutionIds: number[]): Promise<void> {
    let transaction: Transaction | undefined = undefined;
    const solutions: Solution[] = await this.solutionAdminService.selectAllWithSolutionId(solutionIds);
    if (solutions.length <= 0) throw new NotFoundError(`Not Found solutions with using => ${solutionIds}`);

    try {
      transaction = await sequelize.transaction();

      const promises: any[] = [];
      const inquireIds: number[] = solutions.map((solution: Solution) => solution.inquireId);
      const inquires: Inquire[] = await this.inquireAdminService.selectByPk(inquireIds);

      await this.solutionAdminService.deletes(transaction, solutionIds);
      await transaction.commit();

      for (const inquire of inquires) {
        if (inquire.solution?.solutionImages) {
          promises.push(await deleteFolder(this.solutionImageAdminService.getFolderPath(inquire.userId, inquire.inquireId)));
        }
      }

      await Promise.allSettled(promises);
    } catch (error) {
      if (transaction) await transaction.rollback();
      logger.error(`Inquire delete error => ${JSON.stringify(error)}`);

      throw error;
    }
  }
}

export default SolutionAdminController;
