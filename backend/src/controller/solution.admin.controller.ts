import { File } from "formidable";
import BadRequestError from "../error/badRequest.error";
import { Inquire } from "../model/inquire.model";
import { ICreate, Solution } from "../model/solution.model";
import InquireAdminService from "../service/inquire.admin.service";
import SolutionAdminService from "../service/solution.admin.service";
import SolutionImageAdminService from "../service/solutionImage.admin.service";
import { Transaction } from "sequelize";
import sequelize from "../model";
import { deleteFolder } from "../util/firebase.util";
import logger from "../logger/logger";
import ConflictError from "../error/conflict.error";

class SolutionAdminController {
    private solutionAdminService: SolutionAdminService;
    private solutionImageAdminService: SolutionImageAdminService;
    private inquireAdminService: InquireAdminService;

    constructor(solutionAdminService: SolutionAdminService, solutionImageAdminService: SolutionImageAdminService, inquireAdminService: InquireAdminService) {
        this.solutionAdminService = solutionAdminService;
        this.solutionImageAdminService = solutionImageAdminService;
        this.inquireAdminService = inquireAdminService;
    }

    async addSolution(inquireId: number, data: ICreate) {
        const inquires: Inquire[] = await this.inquireAdminService.selectByPk([inquireId]);
        if (inquires.length <= 0) throw new BadRequestError(`Not found inquires with using inquireId : ${inquireId}`);

        const solution: Solution | null = await this.solutionAdminService.select(inquireId);
        if (solution) throw new ConflictError(`This inquiry has a solution => inquire : ${inquireId}`);

        await this.solutionAdminService.create(null, inquireId, data);
        const url: string = this.solutionAdminService.getURL();

        return url;
    }

    async addSolutionWithImages(userId: number, inquireId: number, data: ICreate, images: File | File[]) {
        const inquires: Inquire[] = await this.inquireAdminService.selectByPk([inquireId]);
        if (inquires.length <= 0) throw new BadRequestError(`Not found inquires with using inquireId : ${inquireId}`);

        const solution: Solution | null = await this.solutionAdminService.select(inquireId);
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
}

export default SolutionAdminController;
