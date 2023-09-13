import { OrderItem, Transaction } from "sequelize";

import { API_ROOT } from "..";

import { Inquiry } from "../models/inquiry.model";
import { InquiryImage } from "../models/inquiryImage.model";
import { Solution } from "../models/solution.model";
import { SolutionImage } from "../models/solutionImage.model";

import { Service } from "./service";
import { CreateInquiry, PageOptions, ResponseInquiry } from "../types/inquiry.type";
import { createSortOptions } from "../utils/sort.util";

class InquiryService extends Service {
  private FOLDER_NAME = "users";

  getFolderPath(userId: number, inquiryId: number): string {
    return `${this.FOLDER_NAME}/${userId}/inquires/${inquiryId}`;
  }

  getURL(): string {
    return `${API_ROOT}/inquiry/`;
  }

  async select(...args: any[]): Promise<Inquiry | null> {
    throw new Error("Method not implemented.");
  }

  /**
   * userId가 가진 모든 문의내역을 검색 및 반환합니다.
   *
   * @param userId 유저가 가지는 고유한 아이디
   * @param pageOptions {@link PageOptions} - 일반 inquiry API에서는 r로 고정
   * @returns Promise\<{@link ResponseInquiry}\>
   */
  async selectForResponse(userId: number, pageOptions: PageOptions): Promise<ResponseInquiry> {
    const sortOptions: OrderItem = createSortOptions(pageOptions.sort);
    const offset: number = (pageOptions.page - 1) * pageOptions.count;

    const total = await Inquiry.count({ where: { userId } });
    const inquires: Inquiry[] = await Inquiry.findAll({
      where: { userId },
      order: [sortOptions],
      offset,
      limit: pageOptions.count,
      include: [
        {
          model: InquiryImage,
          as: "inquiryImages",
          attributes: { exclude: ["inquiryId"] }
        },
        {
          model: Solution,
          as: "solution",
          attributes: { exclude: ["inquiryId"] },
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

    return { inquires, total };
  }

  /**
   * 문의 내역을 추가합니다.
   *
   * @param transaction 현재 사용중인 트랜잭션
   * @param data {@link CreateInquiry}
   * @returns Promise\<{@link Inquiry}\>
   */
  async create(transaction: Transaction | null = null, data: CreateInquiry): Promise<Inquiry> {
    const inquiry: Inquiry = await Inquiry.create(data, { transaction });
    return inquiry;
  }

  update(transaction: Transaction | null, ...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }
  delete(transaction: Transaction | null, ...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }
}

export default InquiryService;
