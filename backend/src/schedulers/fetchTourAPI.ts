import schedule from "node-schedule";
import logger from "../logger/logger.js";
import RestaurantController from "../controllers/restaurant.controller.js";
import RestaurantService from "../services/restaurant.service.js";
import VenuesImageService from "../services/venuesImage.service.js";

const rule = new schedule.RecurrenceRule();
// rule.date = 1;
rule.hour = 0;
rule.minute = 0;
rule.second = 0;
rule.tz = "Asia/Seoul";

const restaurantService: RestaurantService = new RestaurantService();
const venuesImageService: VenuesImageService = new VenuesImageService();
const restaurantController: RestaurantController = new RestaurantController(restaurantService, venuesImageService);

const fetchRestaurant = async () => {
  try {
    await restaurantController.addRestaurants();
  } catch (error) {
    logger.error(`Faild fetch Restaurant and reason => ${JSON.stringify(error)}`);
  }
};

const schedules = {
  fetchAreaCode: schedule.scheduleJob(rule, fetchRestaurant)
};

export default schedules;
