import { Transaction } from "sequelize";

import { API_ROOT } from "..";

import { ICreate, Inquire, IUpdateWithService } from "../model/inquire.model";
import { InquireImage } from "../model/inquireImage.model";
import { Solution } from "../model/solution.model";
import { SolutionImage } from "../model/solutionImage.model";

import { Service } from "./service";

class InquireService extends Service {
    private FOLDER_NAME = "users";

    getFolderPath(userId: number, inquireId: number): string {
        return `${this.FOLDER_NAME}/${userId}/inquires/${inquireId}`;
    }

    getURL(inquireId: number): string {
        return `${API_ROOT}/inquire/${inquireId}`;
    }

    async select(inquireId: number): Promise<Inquire | null> {
        const inquire: Inquire | null = await Inquire.findOne({
            where: { inquireId },
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

        return inquire;
    }

    async selectAll(userId: number): Promise<Inquire[]> {
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

        return inquires;
    }

    async create(transaction: Transaction | null = null, inquireData: ICreate): Promise<Inquire> {
        const inquire: Inquire = await Inquire.create(inquireData, { transaction });
        return inquire;
    }

    async update(transaction: Transaction | null = null, inquire: Inquire, data: IUpdateWithService): Promise<Inquire> {
        const updatedInquire: Inquire = await inquire.update(data, { transaction });
        return updatedInquire;
    }

    async delete(transaction: Transaction | null = null, inquire: Inquire): Promise<void> {
        await inquire.destroy({ transaction });
    }

    async deletes(transaction: Transaction | null = null, inquireIds: number[]): Promise<void> {
        await Inquire.destroy({
            where: { inquireId: inquireIds },
            transaction
        });
    }
}

export default InquireService;
