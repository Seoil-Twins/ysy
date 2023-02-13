import dayjs from "dayjs";
import { File } from "formidable";

import NotFoundError from "../error/notFound";
import ConflictError from "../error/conflict";

import sequelize from "../model";
import { ICreate, Inquire, IUpdate } from "../model/inquire.model";
import { InquireImage } from "../model/inquireImage.model";
import { Solution } from "../model/solution.model";

import logger from "../logger/logger";
import { deleteFile, deleteFolder, getAllFiles, uploadFile } from "../util/firebase";
import { SolutionImage } from "../model/solutionImage.model";
import { Transaction } from "sequelize";
import { ErrorImage } from "../model/errorImage.model";

const folderName = "users";

/**
 * inquireImage 다중 Image 생성 및 변경을 해주는 함수
 * @param inquireId Inquire Id
 * @param userId User Id (이미지 path 생성할 때 사용)
 * @param imageData Request로 받은 Image
 * @param transaction transaction
 */
const uploads = async (inquireId: number, userId: number, imageData: File | File[], transaction: Transaction): Promise<void> => {
    const firebaseUploads = [];

    try {
        if (imageData instanceof Array<File>) {
            for (let i = 0; i < imageData.length; i++) {
                const image = imageData[i];
                const path = `${folderName}/${userId}/inquires/${inquireId}/${dayjs().valueOf()}.${image.originalFilename}`;

                await uploadFile(path, image.filepath);
                firebaseUploads.push(path);

                await InquireImage.create(
                    {
                        inquireId: inquireId,
                        image: path
                    },
                    { transaction }
                );

                logger.debug(`Create Inquire Image => ${path}`);
            }
        } else if (imageData instanceof File) {
            const path = `${folderName}/${userId}/inquires/${inquireId}/${dayjs().valueOf()}.${imageData.originalFilename}`;

            await uploadFile(path, imageData.filepath);
            firebaseUploads.push(path);

            await InquireImage.create(
                {
                    inquireId: inquireId,
                    image: path
                },
                { transaction }
            );

            logger.debug(`Create Inquire Image => ${path}`);
        }
    } catch (error) {
        logger.error(`DB Erorr => ${JSON.stringify(error)}`);

        for (let i = 0; i < firebaseUploads.length; i++) {
            await deleteFile(firebaseUploads[i]);
            logger.warn(`Firebase Delete => ${firebaseUploads[i]}`);
        }

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
        const transaction = await sequelize.transaction();

        try {
            const inquire: Inquire = await Inquire.create(inquireData, { transaction: transaction });
            logger.debug(`Create Inquire => ${JSON.stringify(inquire)}`);

            if (imageData) await uploads(inquire.inquireId, inquire.userId, imageData, transaction);
            transaction.commit();
        } catch (error) {
            transaction.rollback();

            throw error;
        }
    },
    /**
     * 문의사항을 수정합니다.
     * @param inquireData {@link IUpdate}
     * @param imageData {@link File} or {@link File} List
     */
    updateInquire: async (inquireData: IUpdate, imageData: File | File[]): Promise<void> => {
        const transaction = await sequelize.transaction();

        try {
            const inquire: Inquire | null = await Inquire.findByPk(inquireData.inquireId);
            if (!inquire) throw new NotFoundError("Not Found inquire");
            else if (inquire.solution) throw new ConflictError("This inquiry has already been answered");

            const images: InquireImage[] = await InquireImage.findAll({ where: { inquireId: inquire.inquireId } });

            if (imageData) {
                await inquire.update(inquireData, { transaction });

                for (let i = 0; i < images.length; i++) {
                    logger.debug(`Destroy Data => ${images[i].image}`);
                    await deleteFile(images[i].image);
                    await images[i].destroy({ transaction });
                }

                await uploads(inquire.inquireId, inquire.userId, imageData, transaction);
            }

            transaction.commit();
        } catch (error) {
            transaction.rollback();

            throw error;
        }
    },
    /**
     * 문의사항을 삭제합니다.
     * @param inquireId Inquire Id
     */
    deleteInquire: async (inquireId: number): Promise<void> => {
        const transaction = await sequelize.transaction();

        try {
            const inquire: Inquire | null = await Inquire.findByPk(inquireId);
            if (!inquire) throw new NotFoundError("Not Found Inquire");
            else if (inquire.solution) throw new ConflictError("This inquiry has already been answered");

            const inquireImage: InquireImage[] = await InquireImage.findAll({ where: { inquireId } });

            for (let i = 0; i < inquireImage.length; i++) {
                const data = inquireImage[i];
                await data.destroy({ transaction });
            }

            await inquire.destroy({ transaction });

            if (inquireImage.length > 0) {
                const path = `${folderName}/${inquire.userId}/inquires/${inquireId}`;
                await deleteFolder(path);
                const images = await getAllFiles(path);

                // 지워지지 않은 이미지가 존재할 시
                if (images.items.length) {
                    images.items.forEach(async (image) => {
                        logger.warn(`Image not deleted, Inquire Id : ${inquire.inquireId} => ${image.fullPath}`);

                        await ErrorImage.create({ path: image.fullPath });
                    });
                }
            }

            transaction.commit();
        } catch (error) {
            transaction.rollback();

            throw error;
        }
    }
};

export default controller;
