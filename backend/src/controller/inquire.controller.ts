import dayjs from "dayjs";
import { File } from "formidable";

import NotFoundError from "../error/notFound";

import sequelize from "../model";
import { ICreate as ICreateInquire, Inquire } from "../model/inquire.model";
import { InquireImage } from "../model/inquireImage.model";
import { Solution } from "../model/solution.model";

import logger from "../logger/logger";
import { deleteFile, uploadFile } from "../util/firebase";
import { SolutionImage } from "../model/solutionImage.model";

const folderName = "users";

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
     * @param inquireData {@link ICreateInquire}
     * @param imageData {@link File} 또는 File[]
     */
    addInquire: async (inquireData: ICreateInquire, imageData: File | File[]): Promise<void> => {
        const t = await sequelize.transaction();
        const firebaseUploads = [];

        try {
            const inquire: Inquire = await Inquire.create(inquireData, { transaction: t });
            logger.debug(`Create Inquire => ${JSON.stringify(inquire)}`);

            if (imageData) {
                if (imageData instanceof Array<File>) {
                    for (let i = 0; i < imageData.length; i++) {
                        const image = imageData[i];
                        const path = `${folderName}/${inquireData.userId}/inquires/${inquire.inquireId}/${dayjs().valueOf()}.${image.originalFilename}`;

                        await uploadFile(path, image.filepath);
                        firebaseUploads.push(path);

                        await InquireImage.create(
                            {
                                inquireId: inquire.inquireId,
                                image: path
                            },
                            { transaction: t }
                        );

                        logger.debug(`Create Inquire Image => ${path}`);
                    }
                } else if (imageData instanceof File) {
                    const path = `${folderName}/${inquireData.userId}/inquires/${inquire.inquireId}/${dayjs().valueOf()}.${imageData.originalFilename}`;

                    await uploadFile(path, imageData.filepath);
                    firebaseUploads.push(path);

                    await InquireImage.create(
                        {
                            inquireId: inquire.inquireId,
                            image: path
                        },
                        { transaction: t }
                    );

                    logger.debug(`Create Inquire Image => ${path}`);
                }
            }

            t.commit();
        } catch (error) {
            t.rollback();
            logger.error(`DB Erorr => ${JSON.stringify(error)}`);

            if (firebaseUploads.length > 0) {
                firebaseUploads.forEach(async (path: string) => {
                    await deleteFile(path);
                    logger.warn(`Firebase Delete => ${path}`);
                });
            }

            throw error;
        }
    }
};

export default controller;
