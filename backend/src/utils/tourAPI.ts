import * as xml2js from "xml2js";
import axios, { AxiosResponse } from "axios";

import logger from "../logger/logger.js";

import InternalServerError from "../errors/internalServer.error.js";

export interface ResponseRegionCode {
  rnum: number;
  code: string;
  name: string;
}

export interface ResponsePlace {
  addr1: string;
  addr2: string;
  areacode: string;
  booktour: string;
  cat1: string;
  cat2: string;
  cat3: string;
  contentid: string;
  contenttypeid: string;
  createdtime: string;
  firstimage: string;
  firstimage2: string;
  cpyrhtDivCd: string;
  mapx: string;
  mapy: string;
  mlevel: string;
  modifiedtime: string;
  sigungucode: string;
  tel: string;
  title: string;
  zipcode: string;
}

export interface ResponseDetailImage {
  contentid: string;
  originimgurl: string;
  imgname: string;
  smallimageurl: string;
  cpyrhtDivCd: string;
  serialnum: string;
}

export interface ResponseDetailCommon {
  contentid: string;
  contenttypeid: string;
  title: string;
  createdtime: string;
  modifiedtime: string;
  tel: string;
  telname: string;
  homepage?: string;
  booktour: string;
  addr1: string;
  addr2: string;
  zipcode: string;
  overview: string;
}

export interface ResponseDetailIntroWithRestaurant {
  contentid: string;
  contenttypeid: string;
  seat: string;
  kidsfacility: string;
  firstmenu: string;
  treatmenu: string;
  smoking: string;
  packing: string;
  infocenterfood: string;
  scalefood: string;
  parkingfood: string;
  opendatefood: string;
  opentimefood: string;
  restdatefood: string;
  discountinfofood: string;
  chkcreditcardfood: string;
  reservationfood: string;
  lcnsno: string;
}

export interface ResponseDetailIntroWithTouristSpot {
  contentid: string;
  contenttypeid: string;
  heritage1: string;
  heritage2: string;
  heritage3: string;
  infocenter: string;
  opendate: string;
  restdate: string;
  expguide: string;
  expagerange: string;
  accomcount: string;
  useseason: string;
  usetime: string;
  parking: string;
  chkbabycarriage: string;
  chkpet: string;
  chkcreditcard: string;
}

export interface ResponseDetailIntroWithCulture {
  contentid: string;
  contenttypeid: string;
  scale: string;
  usefee: string;
  discountinfo: string;
  spendtime: string;
  parkingfee: string;
  infocenterculture: string;
  accomcountculture: string;
  usetimeculture: string;
  restdateculture: string;
  parkingculture: string;
  chkbabycarriageculture: string;
  chkpetculture: string;
  chkcreditcardculture: string;
}

export interface ResponseDetailIntroWithSports {
  contentid: string;
  contenttypeid: string;
  openperiod: string;
  reservation: string;
  infocenterleports: string;
  scaleleports: string;
  accomcountleports: string;
  restdateleports: string;
  usetimeleports: string;
  usefeeleports: string;
  expagerangeleports: string;
  parkingleports: string;
  parkingfeeleports: string;
  chkbabycarriageleports: string;
  chkpetleports: string;
  chkcreditcardleports: string;
}

export interface ResponseDetailIntroWithShopping {
  contentid: string;
  contenttypeid: string;
  saleitem: string;
  saleitemcost: string;
  fairday: string;
  opendateshopping: string;
  shopguide: string;
  culturecenter: string;
  restroom: string;
  infocentershopping: string;
  scaleshopping: string;
  restdateshopping: string;
  parkingshopping: string;
  chkbabycarriageshopping: string;
  chkpetshopping: string;
  chkcreditcardshopping: string;
  opentime: string;
}

const API_KEY = process.env.TOUR_API_KEY;
const defaultParams = {
  serviceKey: API_KEY,
  MobileOS: "ETC",
  MobileApp: "YSY",
  _type: "json"
};

const ROOT_API_URL = "https://apis.data.go.kr/B551011/KorService1";
const REGIONCODE_API_URL = `${ROOT_API_URL}/areaCode1`,
  AREABASED_API_URL = `${ROOT_API_URL}/areaBasedList1`,
  DETAIL_IMAGE_API_URL = `${ROOT_API_URL}/detailImage1`,
  DETAIL_COMMON_API_URL = `${ROOT_API_URL}/detailCommon1`,
  DETAIL_INTRO_API_URL = `${ROOT_API_URL}/detailIntro1`;

const getHrefURL = (url: string): string => {
  const regexPattern = /href="([^"]*)"/;

  const match = url.match(regexPattern);

  if (match && match.length > 1) {
    const hrefValue = match[1];
    return hrefValue;
  } else {
    return url;
  }
};

const convertHomepage = (data: ResponseDetailCommon) => {
  if (data.homepage) {
    data.homepage = getHrefURL(data.homepage);
  } else {
    data.homepage = undefined;
  }

  return data;
};

const fetchTourAPI = async (url: string, customParams: any): Promise<any> => {
  try {
    const config = {
      params: {
        ...defaultParams,
        ...customParams
      }
    };

    const response: AxiosResponse<any, any> = await axios.get(url, config);

    if (response.status === 200) {
      if (!response.data.response) {
        if (response.data.resultMsg) {
          logger.error(`Tour API Error ${JSON.stringify(response.data)} ${new Error().stack}`);
          throw new InternalServerError(`Tour API Error`);
        } else {
          // Tour API는 에러 발생시 XML 형태로 넘어옴
          const json = await xml2js.parseStringPromise(response.data);

          if (Number(json.OpenAPI_ServiceResponse.cmmMsgHeader[0].returnReasonCode[0]) === 30) {
            logger.error(`Tour API Error because invalid API Key. Please change tour API key ${JSON.stringify(response.data)}`);
            throw new InternalServerError(`Tour API Error because invalid API Key. Please change tour API key`);
          } else {
            logger.error(`Tour API Error in global error ${JSON.stringify(response.data)}`);
            return undefined;
          }
        }
      }
      const items = response.data.response.body.items;

      if (items.length === "" || (Array.isArray(items) && items.length === 0)) {
        return undefined;
      }

      const results: any = response.data.response.body.items.item;
      return results;
    } else {
      throw new Error(`Fetch success TourAPI but invalid statusCode => ${JSON.stringify(response)}`);
    }
  } catch (error) {
    throw error;
  }
};

export const fetchRegionCode = async (customParams?: any): Promise<ResponseRegionCode[]> => {
  const params = {
    ...customParams,
    numOfRows: 100
  };

  const results: ResponseRegionCode[] | undefined = await fetchTourAPI(REGIONCODE_API_URL, params);
  return results ? results : [];
};

export const fetchAreaBased = async (customParams?: any): Promise<ResponsePlace[]> => {
  const params = {
    ...customParams,
    numOfRows: 100
  };

  const response: ResponsePlace[] | undefined = await fetchTourAPI(AREABASED_API_URL, params);

  if (response) {
    const results: ResponsePlace[] = response.filter(
      (result: ResponsePlace) => result.areacode.trim() !== "" && result.areacode && result.sigungucode.trim() !== "" && result.sigungucode
    );
    return results;
  } else {
    return [];
  }
};

export const fetchDetailImage = async (contentId: string): Promise<ResponseDetailImage | undefined> => {
  const params = {
    contentId,
    imageYN: "Y",
    subImageYN: "Y"
  };

  const results: ResponseDetailImage[] | undefined = await fetchTourAPI(DETAIL_IMAGE_API_URL, params);
  return results && results.length > 0 && results[0].originimgurl ? results[0] : undefined;
};

export const fetchDetailCommon = async (contentId: string): Promise<ResponseDetailCommon | undefined> => {
  const params = {
    contentId,
    defaultYN: "Y",
    addrinfoYN: "Y",
    overviewYN: "Y"
  };
  const response: ResponseDetailCommon[] | undefined = await fetchTourAPI(DETAIL_COMMON_API_URL, params);

  if (response && response.length > 0) {
    const isNotEmpty = response[0].overview && response[0].overview.trim() !== "" && (response[0].addr1.trim() !== "" || response[0].addr1 === null);

    if (!isNotEmpty) {
      return undefined;
    }

    const result: ResponseDetailCommon | undefined = convertHomepage(response[0]);
    return result;
  } else {
    return undefined;
  }
};

export const fetchDetailIntroWithRestaurant = async (contentId: string, contentTypeId: string): Promise<ResponseDetailIntroWithRestaurant | undefined> => {
  const params = {
    contentId,
    contentTypeId
  };

  const results: ResponseDetailIntroWithRestaurant[] | undefined = await fetchTourAPI(DETAIL_INTRO_API_URL, params);
  return results && results.length > 0 ? results[0] : undefined;
};

export const fetchDetailIntroWithTouristSpot = async (contentId: string, contentTypeId: string): Promise<ResponseDetailIntroWithTouristSpot | undefined> => {
  const params = {
    contentId,
    contentTypeId
  };

  const results: ResponseDetailIntroWithTouristSpot[] | undefined = await fetchTourAPI(DETAIL_INTRO_API_URL, params);
  return results && results.length > 0 ? results[0] : undefined;
};

export const fetchDetailIntroWithSports = async (contentId: string, contentTypeId: string): Promise<ResponseDetailIntroWithSports | undefined> => {
  const params = {
    contentId,
    contentTypeId
  };

  const results: ResponseDetailIntroWithSports[] | undefined = await fetchTourAPI(DETAIL_INTRO_API_URL, params);
  return results && results.length > 0 ? results[0] : undefined;
};

export const fetchDetailIntroWithCulture = async (contentId: string, contentTypeId: string): Promise<ResponseDetailIntroWithCulture | undefined> => {
  const params = {
    contentId,
    contentTypeId
  };

  const results: ResponseDetailIntroWithCulture[] | undefined = await fetchTourAPI(DETAIL_INTRO_API_URL, params);
  return results && results.length > 0 ? results[0] : undefined;
};

export const fetchDetailIntroWithShopping = async (contentId: string, contentTypeId: string): Promise<ResponseDetailIntroWithShopping | undefined> => {
  const params = {
    contentId,
    contentTypeId
  };

  const results: ResponseDetailIntroWithShopping[] | undefined = await fetchTourAPI(DETAIL_INTRO_API_URL, params);
  return results && results.length > 0 ? results[0] : undefined;
};

export const replaceEmptyStringToNull = (obj?: Record<string, any>): void => {
  if (!obj) return;

  for (const key in obj) {
    if (obj.hasOwnProperty(key) && obj[key] === "" && key !== "addr2") {
      obj[key] = null;
    }
  }
};
