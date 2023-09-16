import * as xml2js from "xml2js";
import axios, { AxiosResponse, AxiosRequestConfig } from "axios";

import logger from "../logger/logger.js";

import InternalServerError from "../errors/internalServer.error.js";

export interface ResponseRegionCode {
  rnum: number;
  code: string;
  name: string;
}

const API_KEY = process.env.TOUR_API_KEY;
const defaultParams = {
  serviceKey: API_KEY,
  MobileOS: "ETC",
  MobileApp: "YSY",
  _type: "json"
};

export const fetchRegionCode = async (customParams?: any): Promise<ResponseRegionCode[]> => {
  const url: string = `https://apis.data.go.kr/B551011/KorService1/areaCode1`;

  try {
    const config = {
      params: {
        ...defaultParams,
        ...customParams,
        numOfRows: 50
      }
    };
    const response: AxiosResponse<any, any> = await axios.get(url, config);

    if (response.status === 200) {
      if (!response.data.response) {
        // Tour API는 에러 발생시 XML 형태로 넘어옴
        const json = await xml2js.parseStringPromise(response.data);

        if (Number(json.OpenAPI_ServiceResponse.cmmMsgHeader[0].returnReasonCode[0]) === 30) {
          logger.error(`Tour API Error because invalid API Key. Please change tour API key ${JSON.stringify(response.data)}`);
          throw new InternalServerError(`Tour API Error because invalid API Key. Please change tour API key`);
        } else {
          logger.error(`Tour API Error ${JSON.stringify(response.data)}`);
          throw new InternalServerError(`Tour API Error`);
        }
      }

      const citys: ResponseRegionCode[] = response.data.response.body.items.item;
      return citys;
    } else {
      throw new Error(`Fetch success TourAPI but invalid statusCode => ${JSON.stringify(response)}`);
    }
  } catch (error) {
    throw error;
  }
};
