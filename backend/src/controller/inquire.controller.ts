import dayjs from "dayjs";
import { File } from "formidable";

import NotFoundError from "../error/notFound";
import ConflictError from "../error/conflict";

import sequelize from "../model";
import { ICreate, Inquire, IUpdate } from "../model/inquire.model";
import { InquireImage } from "../model/inquireImage.model";
import { Solution } from "../model/solution.model";

import logger from "../logger/logger";
import { deleteFile, deleteFiles, deleteFolder, uploadFile, uploadFiles } from "../util/firebase";
import { SolutionImage } from "../model/solutionImage.model";
import { Transaction } from "sequelize";

const FOLDER_NAME = "users";

/**
 * inquireImage 다중 Image 생성 및 변경을 해주는 함수
 * @param inquireId Inquire Id
 * @param userId User Id (이미지 path 생성할 때 사용)
 * @param images Request로 받은 Image
 * @param transaction transaction
 */
const uploads = async (inquireId: number, userId: number, images: File | File[], transaction: Transaction): Promise<void> => {
    try {
        if (images instanceof Array<File>) {
            const filePaths: string[] = [];
            const imagePaths: string[] = [];

            images.forEach((image: File) => {
                filePaths.push(image.filepath);
                imagePaths.push(`${FOLDER_NAME}/${userId}/inquires/${inquireId}/${dayjs().valueOf()}.${image.originalFilename}`);
            });

            const [successResults, failedResults]: PromiseSettledResult<any>[][] = await uploadFiles(filePaths, imagePaths);

            failedResults.forEach((failed) => {
                logger.error(`Add inquire image error and ignore => ${JSON.stringify(failed)}`);
            });

            for (const result of successResults) {
                if (result.status === "fulfilled") {
                    const path = result.value.metadata.fullPath;
                    logger.debug(`Create Inquire Image => ${path}`);

                    await InquireImage.create(
                        {
                            inquireId: inquireId,
                            image: path
                        },
                        { transaction }
                    );
                }
            }
        } else if (images instanceof File) {
            const path = `${FOLDER_NAME}/${userId}/inquires/${inquireId}/${dayjs().valueOf()}.${images.originalFilename}`;

            await InquireImage.create(
                {
                    inquireId: inquireId,
                    image: path
                },
                { transaction }
            );

            await uploadFile(path, images.filepath);

            logger.debug(`Create inquire image => ${path}`);
        }
    } catch (error) {
        logger.error(`Inquire image create error ${JSON.stringify(error)}`);
        throw error;
    }
};

const controller = {
    /**
     * 문의사항들을 가져옵니다.
     * @param userId User ID
     * @returns A {@link Inquire} List
     */
    getInquires: async (userId: number): Promise<Inquire[]> => {
        const inquires: Inquire[] = await Inquire.findAll({
            where: { userId },
            include: [
                {
                    model: InquireImage,
                    as: "inquireImages",
                    attributes: { exclude: ["inquireId"] }
                },
                {
                    model: Solution,
                    as: "solution",
                    attributes: { exclude: ["inquireId"] },
                    include: [
                        {
                            model: SolutionImage,
                            as: "solutionImages",
                            attributes: { exclude: ["solutionId"] }
                        }
                    ]
                }
            ]
        });

        if (inquires.length <= 0) throw new NotFoundError("Not Found Inquires");

        return inquires;
    },
    /**
     * 문의사항을 추가합니다.
     * @param inquireData {@link ICreate}
     * @param imageData {@link File} 또는 File[]
     */
    addInquire: async (inquireData: ICreate, imageData: File | File[]): Promise<void> => {
        let transaction: Transaction | undefined = undefined;

        try {
            transaction = await sequelize.transaction();

            const inquire: Inquire = await Inquire.create(inquireData, { transaction });
            logger.debug(`Create Inquire => ${JSON.stringify(inquire)}`);

            if (imageData) await uploads(inquire.inquireId, inquire.userId, imageData, transaction);
            await transaction.commit();
        } catch (error) {
            if (transaction) await transaction.rollback();

            throw error;
        }
    },
    /**
     * 문의사항을 수정합니다.
     * @param inquireData {@link IUpdate}
     * @param imageData {@link File} or {@link File} List
     */
    updateInquire: async (inquireData: IUpdate, imageData: File | File[]): Promise<void> => {
        let transaction: Transaction | undefined = undefined;

        try {
            const inquire: Inquire | null = await Inquire.findByPk(inquireData.inquireId);
            if (!inquire) throw new NotFoundError("Not Found inquire");
            else if (inquire.solution) throw new ConflictError("This inquiry has already been answered");

            const images: InquireImage[] = await InquireImage.findAll({ where: { inquireId: inquire.inquireId } });

            transaction = await sequelize.transaction();

            if (imageData) {
                const imagePaths: string[] = [];
                const imageIds: number[] = [];

                images.forEach((image: InquireImage) => {
                    imagePaths.push(image.image);
                    imageIds.push(image.imageId);
                });

                await InquireImage.destroy({ where: { imageId: imageIds }, transaction });
                await inquire.update(inquireData, { transaction });

                await deleteFiles(imagePaths);
                await uploads(inquire.inquireId, inquire.userId, imageData, transaction);
            }

            await transaction.commit();
        } catch (error) {
            if (transaction) await transaction.rollback();
            logger.error(`Inquire update error | ${inquireData.inquireId} => ${JSON.stringify(error)}`);

            throw error;
        }
    },
    /**
     * 문의사항을 삭제합니다.
     * @param inquireId Inquire Id
     */
    deleteInquire: async (inquireId: number): Promise<void> => {
        let transaction: Transaction | undefined = undefined;

        try {
            const inquire: Inquire | null = await Inquire.findByPk(inquireId);
            if (!inquire) throw new NotFoundError("Not Found Inquire");
            else if (inquire.solution) throw new ConflictError("This inquiry has already been answered");

            transaction = await sequelize.transaction();
            const inquireImage: InquireImage[] = await InquireImage.findAll({ where: { inquireId } });
            const imageIds: number[] = [];

            inquireImage.forEach((image: InquireImage) => {
                imageIds.push(image.imageId);
            });

            await InquireImage.destroy({ where: { imageId: imageIds }, transaction });
            await inquire.destroy({ transaction });

            if (inquireImage.length > 0) {
                const path = `${FOLDER_NAME}/${inquire.userId}/inquires/${inquireId}`;
                await deleteFolder(path);
            }

            await transaction.commit();
        } catch (error) {
            if (transaction) await transaction.rollback();

            throw error;
        }
    }
};

export default controller;
