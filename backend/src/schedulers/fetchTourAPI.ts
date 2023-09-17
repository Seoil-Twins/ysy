import schedule from "node-schedule";
import logger from "../logger/logger.js";
import RestaurantController from "../controllers/restaurant.controller.js";
import RestaurantService from "../services/restaurant.service.js";
import RestaurantImageService from "../services/restaurantImage.service.js";

const rule = new schedule.RecurrenceRule();
// rule.date = 1;
rule.hour = 0;
rule.minute = 0;
rule.second = 0;
rule.tz = "Asia/Seoul";

const restaurantService: RestaurantService = new RestaurantService();
const restaurantImageService: RestaurantImageService = new RestaurantImageService();
const restaurantController: RestaurantController = new RestaurantController(restaurantService, restaurantImageService);

const fetchRestaurant = async () => {
  try {
    await restaurantController.addRestaurants();
  } catch (error) {
    logger.error(`Faild fetch Restaurant and reason => ${JSON.stringify(error)}`);
  }
};

const schedules = {
  fetchRestaurant: schedule.scheduleJob(rule, fetchRestaurant)
};

export default schedules;
