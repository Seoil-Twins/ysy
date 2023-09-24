import schedule from "node-schedule";
import logger from "../logger/logger.js";

import ContentTypeService from "../services/contentType.service.js";
import FavoriteService from "../services/favorite.service.js";
import DatePlaceService from "../services/datePlace.service.js";
import DatePlaceImageService from "../services/datePlaceImage.service.js";

import DatePlaceController from "../controllers/datePlace.controller.js";

const tz = "Asia/Seoul";

const rule = new schedule.RecurrenceRule();
// rule.date = 1;
rule.hour = 0;
rule.minute = 0;
rule.second = 0;
rule.tz = tz;

const contentTypeService: ContentTypeService = new ContentTypeService();

const datePlaceService: DatePlaceService = new DatePlaceService();
const datePlaceImageService: DatePlaceImageService = new DatePlaceImageService();
const datePlaceController: DatePlaceController = new DatePlaceController(contentTypeService, datePlaceService, datePlaceImageService);

const fetchRestaurant = async () => {
  try {
    await datePlaceController.addRestaurants();
  } catch (error) {
    logger.error(`Faild fetch Restaurant and reason => ${JSON.stringify(error)}`);
  }
};

const fetchTouristSpot = async () => {
  try {
    await datePlaceController.addTouristSpot();
  } catch (error) {
    logger.error(`Faild fetch TouristSpot and reason => ${JSON.stringify(error)}`);
  }
};

const fetchCulture = async () => {
  try {
    await datePlaceController.addCulture();
  } catch (error) {
    logger.error(`Faild fetch TouristSpot and reason => ${JSON.stringify(error)}`);
  }
};

const fetchSports = async () => {
  try {
    await datePlaceController.addSports();
  } catch (error) {
    logger.error(`Faild fetch TouristSpot and reason => ${JSON.stringify(error)}`);
  }
};

const fetchShopping = async () => {
  try {
    await datePlaceController.addShopping();
  } catch (error) {
    logger.error(`Faild fetch TouristSpot and reason => ${JSON.stringify(error)}`);
  }
};

const increasePageNo = () => {
  datePlaceController.increasePageNo();
};

const schedules = {
  fetchRestaurant: schedule.scheduleJob(rule, fetchRestaurant),
  fetchTouristSpot: schedule.scheduleJob(rule, fetchTouristSpot),
  fetchCulture: schedule.scheduleJob(rule, fetchCulture),
  fetchSports: schedule.scheduleJob(rule, fetchSports),
  fetchShopping: schedule.scheduleJob(rule, fetchShopping),
  increasePageNo: schedule.scheduleJob(
    {
      hour: 6,
      minute: 0,
      second: 0,
      tz
    },
    increasePageNo
  )
};

export default schedules;
