import { Transaction, WhereOptions } from "sequelize";

import { Service } from "./service.js";
import { Favorite } from "../models/favorite.model.js";
import { RequestFavorite } from "../types/favorite.type.js";

class FavoriteService extends Service {
  getURL(...args: any[]): string {
    throw new Error("Method not implemented.");
  }

  async selectAll(): Promise<Favorite[] | null> {
    const favorite: Favorite[] | null = await Favorite.findAll();
    return favorite;
  }

  async select(where: WhereOptions<Favorite>): Promise<Favorite | null> {
    const favorite: Favorite | null = await Favorite.findOne({ where });
    return favorite;
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
