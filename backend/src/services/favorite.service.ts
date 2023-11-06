import { OrderItem, Transaction, WhereOptions } from "sequelize";

import { Service } from "./service.js";
import { Favorite } from "../models/favorite.model.js";
import { PageOptions, RequestFavorite, ResponseFavorite, ResponseItem } from "../types/favorite.type.js";
import { createSortOptions } from "../utils/pagination.util.js";
import { CommonSortItem, commonSortOptions } from "../types/sort.type.js";
import { DatePlace } from "../models/datePlace.model.js";
import { DatePlaceView } from "../models/datePlaceView.model.js";

class FavoriteService extends Service {
  getURL(...args: any[]): string {
    throw new Error("Method not implemented.");
  }

  async select(where: WhereOptions<Favorite>): Promise<Favorite | null> {
    const favorite: Favorite | null = await Favorite.findOne({ where });
    return favorite;
  }

  async selectForResponse(userId: number, pageOptions: PageOptions): Promise<ResponseFavorite> {
    const sortOptions: OrderItem = createSortOptions<CommonSortItem>(pageOptions.sort, commonSortOptions);
    const offset: number = (pageOptions.page - 1) * pageOptions.count;

    const { rows, count }: { rows: Favorite[]; count: number } = await Favorite.findAndCountAll({
      include: [
        {
          model: DatePlace,
          as: "datePlace",
          include: [
            {
              model: DatePlaceView,
              as: "datePlaceViews",
              where: { userId },
              required: false
            }
          ]
        }
      ],
      where: { userId },
      offset: offset,
      limit: pageOptions.count,
      order: [sortOptions]
    });

    const results = rows.map((favorite: Favorite) => {
      let isView = false;

      if (favorite.datePlace && Array.isArray(favorite.datePlace.datePlaceViews) && favorite.datePlace.datePlaceViews.length > 0) {
        isView = true;
      }

      const result: ResponseItem = {
        favoriteId: favorite.favoriteId,
        userId: favorite.userId,
        createdTime: favorite.createdTime,
        datePlace: {
          ...favorite.datePlace!.dataValues,
          isView
        }
      } as ResponseItem;

      delete result.datePlace!.datePlaceViews;

      return result;
    });

    return {
      favorites: results,
      total: count
    };
  }

  async create(transaction: Transaction | null, data: RequestFavorite): Promise<Favorite> {
    const createdFavorite: Favorite = await Favorite.create(data, { transaction });
    return createdFavorite;
  }

  update(transaction: Transaction | null, ...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }

  async delete(transaction: Transaction | null, favoirte: Favorite): Promise<void> {
    await favoirte.destroy({ transaction });
  }
}

export default FavoriteService;
