import { Transaction } from "sequelize";
import { Service } from "./service";
import { ICreate, Solution } from "../model/solution.model";
import { API_ROOT } from "..";

class SolutionAdminService extends Service {
    getURL(): string {
        return `${API_ROOT}/admin/inquire?page=1&count=10&sort=sr`;
    }

    async select(inquireId: number): Promise<Solution | null> {
        const solution: Solution | null = await Solution.findOne({
            where: { inquireId }
        });

        return solution;
    }

    async create(transaction: Transaction | null, inquireId: number, data: ICreate): Promise<Solution> {
        const createdSolution: Solution = await Solution.create({
            inquireId,
            ...data
        });

        return createdSolution;
    }

    update(transaction: Transaction | null, ...args: any[]): Promise<any> {
        throw new Error("Method not implemented.");
    }

    delete(transaction: Transaction | null, ...args: any[]): Promise<any> {
        throw new Error("Method not implemented.");
    }
}

export default SolutionAdminService;
