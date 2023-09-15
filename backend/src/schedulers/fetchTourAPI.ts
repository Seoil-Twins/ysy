import axios, { AxiosResponse, AxiosError } from "axios";
import schedule from "node-schedule";
import logger from "../logger/logger.js";

interface ResponseAreaCode {
  rnum: number;
  code: string;
  name: string;
}

const rule = new schedule.RecurrenceRule();
// rule.date = 1;
rule.hour = 0;
rule.minute = 0;
rule.second = 0;
rule.tz = "Asia/Seoul";

const API_KEY = process.env.TOUR_API_KEY;
const params = {
  serviceKey: API_KEY,
  MobileOS: "ETC",
  MobileApp: "YSY",
  _type: "json"
};

const fetchAreaCode = () => {
  const url: string = `https://apis.data.go.kr/B551011/KorService1/areaCode1`;

  const successCity = (response: AxiosResponse<any, any>) => {
    if (response.status === 200) {
      const citys: ResponseAreaCode[] = response.data.response.body.items.item;

      for (const city of citys) {
        console.log(city);
      }
    }
  };

  const failedCity = (error: AxiosError) => {
    logger.error(`Faild fetch area code and reason => ${JSON.stringify(error)}`);
  };

  axios
    .get(url, {
      params
    })
    .then(successCity)
    .catch(failedCity);
};

const schedules = {
  fetchAreaCode: schedule.scheduleJob(rule, fetchAreaCode)
};

export default schedules;
