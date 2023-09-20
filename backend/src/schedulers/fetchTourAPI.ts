import schedule from "node-schedule";
import logger from "../logger/logger.js";
import RestaurantController from "../controllers/restaurant.controller.js";
import RestaurantService from "../services/restaurant.service.js";
import RestaurantImageService from "../services/restaurantImage.service.js";
import TouristSpotService from "../services/touristSpot.service.js";
import TouristSpotImageService from "../services/touristSpotImage.service.js";
import ContentTypeService from "../services/contentType.service.js";
import TouristSpotController from "../controllers/touristSpot.controller.js";
import CultureService from "../services/culture.service.js";
import CultureImageService from "../services/cultureImage.service.js";
import CultureController from "../controllers/culture.controller.js";
import SportsController from "../controllers/sports.controller.js";
import SportsImageService from "../services/sportsImage.service.js";
import SportsService from "../services/sports.service.js";
import ShoppingController from "../controllers/shopping.controller.js";
import ShoppingImageService from "../services/shoppingImage.service.js";
import ShoppingService from "../services/shopping.service.js";

const rule = new schedule.RecurrenceRule();
// rule.date = 1;
rule.hour = 0;
rule.minute = 0;
rule.second = 0;
rule.tz = "Asia/Seoul";

const contentTypeService: ContentTypeService = new ContentTypeService();

const restaurantService: RestaurantService = new RestaurantService();
const restaurantImageService: RestaurantImageService = new RestaurantImageService();
const restaurantController: RestaurantController = new RestaurantController(contentTypeService, restaurantService, restaurantImageService);

const touristSpotService: TouristSpotService = new TouristSpotService();
const touristSpotImageService: TouristSpotImageService = new TouristSpotImageService();
const touristSpotController: TouristSpotController = new TouristSpotController(contentTypeService, touristSpotService, touristSpotImageService);

const cultureService: CultureService = new CultureService();
const cultureImageService: CultureImageService = new CultureImageService();
const cultureController: CultureController = new CultureController(contentTypeService, cultureService, cultureImageService);

const sportsService: SportsService = new SportsService();
const sportsImageService: SportsImageService = new SportsImageService();
const sportsController: SportsController = new SportsController(contentTypeService, sportsService, sportsImageService);

const shoppingService: ShoppingService = new ShoppingService();
const shoppingImageService: ShoppingImageService = new ShoppingImageService();
const shoppingController: ShoppingController = new ShoppingController(contentTypeService, shoppingService, shoppingImageService);

const fetchRestaurant = async () => {
  try {
    await restaurantController.addRestaurants();
  } catch (error) {
    logger.error(`Faild fetch Restaurant and reason => ${JSON.stringify(error)}`);
  }
};

const fetchTouristSpot = async () => {
  try {
    await touristSpotController.addTouristSpot();
  } catch (error) {
    logger.error(`Faild fetch TouristSpot and reason => ${JSON.stringify(error)}`);
  }
};

const fetchCulture = async () => {
  try {
    await cultureController.addCulture();
  } catch (error) {
    logger.error(`Faild fetch TouristSpot and reason => ${JSON.stringify(error)}`);
  }
};

const fetchSports = async () => {
  try {
    await sportsController.addSports();
  } catch (error) {
    logger.error(`Faild fetch TouristSpot and reason => ${JSON.stringify(error)}`);
  }
};

const fetchShopping = async () => {
  try {
    await shoppingController.addShopping();
  } catch (error) {
    logger.error(`Faild fetch TouristSpot and reason => ${JSON.stringify(error)}`);
  }
};

const schedules = {
  fetchRestaurant: schedule.scheduleJob(rule, fetchRestaurant),
  fetchTouristSpot: schedule.scheduleJob(rule, fetchTouristSpot),
  fetchCulture: schedule.scheduleJob(rule, fetchCulture),
  fetchSports: schedule.scheduleJob(rule, fetchSports),
  fetchShopping: schedule.scheduleJob(rule, fetchShopping)
};

export default schedules;
