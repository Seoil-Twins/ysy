import { Transaction } from "sequelize";

import BadRequestError from "../errors/badRequest.error.js";
import NotFoundError from "../errors/notFound.error.js";

import { DatePlace } from "../models/datePlace.model.js";
import { Favorite } from "../models/favorite.model.js";
import sequelize from "../models/index.js";

import DatePlaceService from "../services/datePlace.service.js";
import FavoriteService from "../services/favorite.service.js";

import logger from "../logger/logger.js";

import { RequestFavorite } from "../types/favorite.type.js";

class FavoriteController {
  private favoriteService: FavoriteService;
  private datePlaceService: DatePlaceService;

  constructor(favoriteService: FavoriteService, datePlaceService: DatePlaceService) {
    this.favoriteService = favoriteService;
    this.datePlaceService = datePlaceService;
  }

  async addFavorite(data: RequestFavorite): Promise<void> {
    let transaction: Transaction | undefined = undefined;

    const datePlace: DatePlace | null = await this.datePlaceService.select({ contentId: data.contentId });
    if (!datePlace) throw new NotFoundError(`Not found date place with using contentID : ${data.contentId}`);

    const favorite: Favorite | null = await this.favoriteService.select({
      userId: data.userId,
      contentId: data.contentId,
      contentTypeId: data.contentTypeId
    });
    if (favorite) return;

    try {
      transaction = await sequelize.transaction();

      await this.favoriteService.create(transaction, data);
      await transaction.commit();
    } catch (error) {
      if (transaction) await transaction.rollback();

      logger.error(`Failed favorite error => ${error}`);
      throw error;
    }
  }

  async deleteFavorite(data: RequestFavorite): Promise<void> {
    let transaction: Transaction | undefined = undefined;

    const datePlace: DatePlace | null = await this.datePlaceService.select({ contentId: data.contentId });
    if (!datePlace) throw new NotFoundError(`Not found date place with using contentID : ${data.contentId}`);

    const favorite: Favorite | null = await this.favoriteService.select({
      userId: data.userId,
      contentId: data.contentId,
      contentTypeId: data.contentTypeId
    });
    if (!favorite) return;

    try {
      transaction = await sequelize.transaction();

      await this.favoriteService.delete(transaction, favorite);
      await transaction.commit();
    } catch (error) {
      if (transaction) await transaction.rollback();

      logger.error(`Failed favorite error => ${error}`);
      throw error;
    }
  }
}

export default FavoriteController;
