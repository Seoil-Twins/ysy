import dayjs from "dayjs";
import { InferAttributes, InferCreationAttributes, Optional, Transaction } from "sequelize";
import { NullishPropertiesOf } from "sequelize/lib/utils";

import sequelize from "../models/index.js";
import { Restaurant } from "../models/restaurant.model.js";
import { RestaurantImage } from "../models/restaurantImage.model.js";

import {
  ResponsePlace,
  fetchDetailCommon,
  fetchDetailImage,
  fetchAreaBased,
  fetchDetailIntroWithRestaurant,
  ResponseDetailIntroWithRestaurant,
  ResponseDetailCommon,
  ResponseDetailImage,
  replaceEmptyStringToNull
} from "../utils/tourAPI.js";

import RestaurantImageService from "../services/restaurantImage.service.js";
import RestaurantService from "../services/restaurant.service.js";

class RestaurantController {
  private restaurantService: RestaurantService;
  private restaurantImageService: RestaurantImageService;

  constructor(restaurantService: RestaurantService, restaurantImageService: RestaurantImageService) {
    this.restaurantService = restaurantService;
    this.restaurantImageService = restaurantImageService;
  }

  async addRestaurants(): Promise<void> {
    let transaction: Transaction | undefined = undefined;

    try {
      transaction = await sequelize.transaction();
      const restaurantDatas: Partial<InferAttributes<Restaurant>>[] = [];
      const imageDatas: Optional<InferAttributes<RestaurantImage>, NullishPropertiesOf<InferCreationAttributes<RestaurantImage>>>[] = [];
      const restaurantsWithAPI: ResponsePlace[] = await fetchAreaBased({
        contentTypeId: 39
      });

      for (const response of restaurantsWithAPI) {
        const createdTime = dayjs(response.createdtime, { format: "YYYYMMDDHHmmss" }).toDate();
        const data: Partial<InferAttributes<Restaurant>> = {
          contentId: response.contentid,
          contentTypeId: response.contenttypeid,
          title: response.title,
          thumbnail: response.firstimage ? response.firstimage : null,
          mapX: response.mapx,
          mapY: response.mapy,
          mapLevel: response.mlevel,
          areaCode: response.areacode,
          sigunguCode: response.sigungucode,
          registrationTime: createdTime
        };

        const [imageInfo, commonInfo, introInfo]: [
          ResponseDetailImage | undefined,
          ResponseDetailCommon | undefined,
          ResponseDetailIntroWithRestaurant | undefined
        ] = await Promise.all([
          fetchDetailImage(response.contentid),
          fetchDetailCommon(response.contentid),
          fetchDetailIntroWithRestaurant(response.contentid, response.contenttypeid)
        ]);

        replaceEmptyStringToNull(imageInfo);
        replaceEmptyStringToNull(commonInfo);
        replaceEmptyStringToNull(introInfo);

        if (imageInfo) {
          imageDatas.push({
            contentId: response.contentid,
            path: imageInfo.originimgurl
          });
        }
        if (commonInfo) {
          data.address = `${commonInfo.addr1} ${commonInfo.addr2}`.trim();
          data.description = commonInfo.overview;
          data.homepage = commonInfo.homepage;
        }
        if (introInfo) {
          data.kidsFacility = introInfo.kidsfacility;
          data.parking = introInfo.parkingfood;
          data.restDate = introInfo.restdatefood;
          data.signatureDish = introInfo.firstmenu;
          data.smoking = introInfo.smoking;
          data.telephone = introInfo.infocenterfood;
          data.useTime = introInfo.opentimefood;
        }

        restaurantDatas.push(data);
      }

      await this.restaurantService.upserts(transaction, restaurantDatas);
      await this.restaurantImageService.upserts(transaction, imageDatas);
      await transaction.commit();
    } catch (error) {
      if (transaction) await transaction.rollback();

      throw error;
    }
  }
}

export default RestaurantController;
