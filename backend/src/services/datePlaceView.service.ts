import { Transaction, WhereOptions } from "sequelize";

import { Service } from "./service.js";

import { DatePlaceView } from "../models/datePlaceView.model.js";

class DatePlaceViewService extends Service {
  getURL(...args: any[]): string {
    throw new Error("Method not implemented.");
  }

  async select(where: WhereOptions<DatePlaceView>): Promise<DatePlaceView | null> {
    const datePlaceView: DatePlaceView | null = await DatePlaceView.findOne({ where });
    return datePlaceView;
  }

  async create(transaction: Transaction | null, userId: number, contentId: string): Promise<DatePlaceView> {
    const createdDatePlaceViews: DatePlaceView = await DatePlaceView.create(
      {
        userId,
        contentId
      },
      { transaction }
    );
    return createdDatePlaceViews;
  }

  update(transaction: Transaction | null, ...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }

  delete(transaction: Transaction | null, ...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }
}

export default DatePlaceViewService;
