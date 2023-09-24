import { InferAttributes, InferCreationAttributes, Optional, OrderItem, Transaction, WhereOptions } from "sequelize";
import { NullishPropertiesOf } from "sequelize/lib/utils";

import { Service } from "./service.js";

import { FilterOptions, PageOptions, ResponseDatePlace, ResponseItem, SearchOptions } from "../types/datePlace.type.js";

import { DatePlace } from "../models/datePlace.model.js";
import { User } from "../models/user.model.js";

type CreateType = Optional<InferAttributes<DatePlace>, NullishPropertiesOf<InferCreationAttributes<DatePlace>>>[];

class DatePlaceService extends Service {
  getURL(...args: any[]): string {
    throw new Error("Method not implemented.");
  }

  createSortOptions(sort: string): OrderItem {
    let result: OrderItem = ["views", "DESC"];

    switch (sort) {
      case "r":
        result = ["registrationTime", "DESC"];
        break;
      case "f":
        result = ["views", "DESC"];
        break;
      case "t":
        result = ["title", "ASC"];
        break;
      default:
        result = ["views", "DESC"];
        break;
    }

    return result;
  }

  async select(userId: number, pageOptions: PageOptions, searchOptions: SearchOptions, filterOptions?: FilterOptions): Promise<ResponseDatePlace> {
    const offset: number = (pageOptions.page - 1) * pageOptions.count;
    const sortOptions: OrderItem | undefined = this.createSortOptions(pageOptions.sort);

    const where: WhereOptions<DatePlace> = {
      areaCode: searchOptions.areaCode
    };

    if (searchOptions.sigunguCode) {
      where.sigunguCode = searchOptions.sigunguCode;
    }
    if (filterOptions?.kind) {
      where.contentTypeId = filterOptions.kind;
    }

    const { rows, count }: { rows: DatePlace[]; count: number } = await DatePlace.findAndCountAll({
      where,
      order: [sortOptions],
      limit: pageOptions.count,
      offset,
      include: {
        model: User,
        as: "users",
        where: { userId },
        required: false,
        through: {
          attributes: []
        }
      }
    });

    const results: ResponseItem[] = rows.map((item: DatePlace) => {
      const result = {
        ...item.dataValues,
        isFavorite: Array.isArray(item.users) && item.users.length > 0 ? true : false
      } as ResponseItem;

      delete result["users"];
      return result;
    });

    return { results, total: count };
  }

  create(transaction: Transaction | null, ...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }

  update(transaction: Transaction | null, ...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }

  async upsertsWithRestaurant(transaction: Transaction | null, data: Partial<DatePlace>[]): Promise<DatePlace[]> {
    const datePlaces: DatePlace[] = await DatePlace.bulkCreate(data as CreateType, {
      updateOnDuplicate: [
        "address",
        "areaCode",
        "contentTypeId",
        "description",
        "homepage",
        "kidsFacility",
        "mapLevel",
        "mapX",
        "mapY",
        "parking",
        "registrationTime",
        "restDate",
        "signatureDish",
        "sigunguCode",
        "smoking",
        "telephone",
        "thumbnail",
        "title",
        "useTime"
      ],
      transaction
    });

    return datePlaces;
  }

  async upsertsWithTouristSpot(transaction: Transaction | null, data: Partial<DatePlace>[]): Promise<DatePlace[]> {
    const touristSpots: DatePlace[] = await DatePlace.bulkCreate(data as CreateType, {
      updateOnDuplicate: [
        "address",
        "areaCode",
        "contentTypeId",
        "description",
        "homepage",
        "mapLevel",
        "mapX",
        "mapY",
        "parking",
        "registrationTime",
        "restDate",
        "sigunguCode",
        "telephone",
        "thumbnail",
        "title",
        "useTime",
        "useSeason",
        "babyCarriage",
        "pet"
      ],
      transaction
    });

    return touristSpots;
  }

  async upsertsWithCulture(transaction: Transaction | null, data: Partial<DatePlace>[]): Promise<DatePlace[]> {
    const cultures: DatePlace[] = await DatePlace.bulkCreate(data as CreateType, {
      updateOnDuplicate: [
        "address",
        "areaCode",
        "contentTypeId",
        "description",
        "homepage",
        "mapLevel",
        "mapX",
        "mapY",
        "parking",
        "registrationTime",
        "restDate",
        "sigunguCode",
        "telephone",
        "thumbnail",
        "title",
        "useTime",
        "babyCarriage",
        "useFee",
        "pet"
      ],
      transaction
    });

    return cultures;
  }

  async upsertsWithSports(transaction: Transaction | null, data: Partial<DatePlace>[]): Promise<DatePlace[]> {
    const sprots: DatePlace[] = await DatePlace.bulkCreate(data as CreateType, {
      updateOnDuplicate: [
        "address",
        "areaCode",
        "contentTypeId",
        "description",
        "homepage",
        "mapLevel",
        "mapX",
        "mapY",
        "parking",
        "registrationTime",
        "restDate",
        "sigunguCode",
        "telephone",
        "thumbnail",
        "title",
        "useTime",
        "babyCarriage",
        "useFee",
        "availableAge",
        "pet"
      ],
      transaction
    });

    return sprots;
  }

  async upsertsWithShopping(transaction: Transaction | null, data: Partial<DatePlace>[]): Promise<DatePlace[]> {
    const restaurants: DatePlace[] = await DatePlace.bulkCreate(data as CreateType, {
      updateOnDuplicate: [
        "address",
        "areaCode",
        "contentTypeId",
        "description",
        "homepage",
        "mapLevel",
        "mapX",
        "mapY",
        "parking",
        "registrationTime",
        "restDate",
        "sigunguCode",
        "telephone",
        "thumbnail",
        "title",
        "useTime",
        "babyCarriage",
        "pet",
        "saleItem"
      ],
      transaction
    });

    return restaurants;
  }

  delete(transaction: Transaction | null, ...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }
}

export default DatePlaceService;
