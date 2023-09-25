import { InferAttributes, InferCreationAttributes, Op, Optional, OrderItem, Transaction, WhereOptions } from "sequelize";
import { NullishPropertiesOf } from "sequelize/lib/utils";

import { Service } from "./service.js";

import { FilterOptions, PageOptions, ResponseDatePlace, ResponseItem, SearchOptions } from "../types/datePlace.type.js";

import { DatePlace } from "../models/datePlace.model.js";
import { User } from "../models/user.model.js";
import { DatePlaceImage } from "../models/datePlaceImage.model.js";

type CreateType = Optional<InferAttributes<DatePlace>, NullishPropertiesOf<InferCreationAttributes<DatePlace>>>[];

class DatePlaceService extends Service {
  getURL(...args: any[]): string {
    throw new Error("Method not implemented.");
  }

  private createSortOptions(sort: string): OrderItem {
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

  private deleteUserProperty(items: DatePlace[]): ResponseItem[] {
    const results: ResponseItem[] = items.map((item: DatePlace) => {
      const result = {
        ...item.dataValues,
        isFavorite: Array.isArray(item.users) && item.users.length > 0 ? true : false
      } as ResponseItem;

      delete result["users"];
      return result;
    });

    return results;
  }

  /**
   * 페이지네이션, 지역 검색, 유형 검색 등을 사용하여 검색 결과를 반환합니다.
   *
   * @param userId 유저가 가지는 고유한 아이디
   * @param pageOptions {@link PageOptions}
   * @param searchOptions {@link SearchOptions}
   * @param filterOptions {@link FilterOptions}
   * @returns Promise\<{@link ResponseDatePlace}\>
   */
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

    const results: ResponseItem[] = this.deleteUserProperty(rows);
    return { results, total: count };
  }

  /**
   * 검색어를 사용하여 데이트 장소를 검색하여 반환합니다.
   *
   * @param userId 유저가 가지는 고유한 아이디
   * @param keyword 검색어
   * @param pageOptions {@link PageOptions}
   * @returns Promise\<{@link ResponseDatePlace}\>
   */
  async selectWithKeyword(userId: number, keyword: string, pageOptions: PageOptions): Promise<ResponseDatePlace> {
    const offset: number = (pageOptions.page - 1) * pageOptions.count;
    const sortOptions: OrderItem | undefined = this.createSortOptions(pageOptions.sort);

    const where: WhereOptions<DatePlace> = {
      title: {
        [Op.like]: `%${keyword}%`
      }
    };

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

    const results: ResponseItem[] = this.deleteUserProperty(rows);
    return { results, total: count };
  }

  /**
   * contentId를 사용하여 검색 결과를 반환합니다.
   *
   * @param userId 유저가 가지는 고유한 아이디
   * @param contentId 데이트 장소가 가지는 고유한 아이디
   * @returns Promise\<{@link ResponseItem} | null\>
   */
  async selectOne(userId: number, contentId: string): Promise<ResponseItem | null> {
    const where: WhereOptions<DatePlace> = {
      contentId
    };

    const result: DatePlace | null = await DatePlace.findOne({
      where,
      include: [
        {
          model: User,
          as: "users",
          where: { userId },
          required: false,
          through: {
            attributes: []
          }
        },
        {
          model: DatePlaceImage,
          as: "datePlaceImages",
          attributes: {
            exclude: ["contentId"]
          }
        }
      ]
    });

    if (result) {
      const results: ResponseItem[] = this.deleteUserProperty([result]);
      return results[0];
    } else {
      return result;
    }
  }

  create(transaction: Transaction | null, ...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }

  update(transaction: Transaction | null, ...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }

  /**
   * 음식점을 추가하거나 기존에 있는 데이터를 수정합니다.
   *
   * @param transaction 현재 사용중인 트랜잭션
   * @param data {@link DatePlace}
   * @returns Promise\<{@link DatePlace DatePlace[]} | null\>
   */
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

  /**
   * 관광지를 추가하거나 기존에 있는 데이터를 수정합니다.
   *
   * @param transaction 현재 사용중인 트랜잭션
   * @param data {@link DatePlace}
   * @returns Promise\<{@link DatePlace DatePlace[]} | null\>
   */
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

  /**
   * 문화시설을 추가하거나 기존에 있는 데이터를 수정합니다.
   *
   * @param transaction 현재 사용중인 트랜잭션
   * @param data {@link DatePlace}
   * @returns Promise\<{@link DatePlace DatePlace[]} | null\>
   */
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

  /**
   * 레포츠를 추가하거나 기존에 있는 데이터를 수정합니다.
   *
   * @param transaction 현재 사용중인 트랜잭션
   * @param data {@link DatePlace}
   * @returns Promise\<{@link DatePlace DatePlace[]} | null\>
   */
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

  /**
   * 쇼핑몰을 추가하거나 기존에 있는 데이터를 수정합니다.
   *
   * @param transaction 현재 사용중인 트랜잭션
   * @param data {@link DatePlace}
   * @returns Promise\<{@link DatePlace DatePlace[]} | null\>
   */
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
