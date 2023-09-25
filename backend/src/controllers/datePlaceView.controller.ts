import { Op, Transaction } from "sequelize";

import DatePlaceService from "../services/datePlace.service.js";
import DatePlaceViewService from "../services/datePlaceView.service.js";

import sequelize from "../models/index.js";
import { DatePlace } from "../models/datePlace.model.js";
import { DatePlaceView } from "../models/datePlaceView.model.js";

import logger from "../logger/logger.js";

import NotFoundError from "../errors/notFound.error.js";

class DatePlaceViewController {
  private datePlaceViewService: DatePlaceViewService;
  private datePlaceService: DatePlaceService;

  constructor(datePlaceViewService: DatePlaceViewService, datePlaceService: DatePlaceService) {
    this.datePlaceViewService = datePlaceViewService;
    this.datePlaceService = datePlaceService;
  }

  async increaseView(userId: number, contentId: string): Promise<DatePlace> {
    let transaction: Transaction | undefined = undefined;
    const datePlace: DatePlace | null = await this.datePlaceService.select({ contentId });
    const datePlaceView: DatePlaceView | null = await this.datePlaceViewService.select({
      [Op.and]: [
        {
          contentId,
          userId
        }
      ]
    });

    if (!datePlace) throw new NotFoundError(`Not found error using contentId : ${contentId}`);
    else if (datePlaceView) return datePlace;

    try {
      transaction = await sequelize.transaction();

      const updatedDatePlace: DatePlace = await this.datePlaceService.update(transaction, datePlace, { views: datePlace.views + 1 });
      await this.datePlaceViewService.create(transaction, userId, contentId);

      await transaction.commit();
      return updatedDatePlace;
    } catch (error) {
      if (transaction) await transaction.rollback();

      logger.error(`IncreaseView Error => ${JSON.stringify(error)}`);
      throw error;
    }
  }
}

export default DatePlaceViewController;
