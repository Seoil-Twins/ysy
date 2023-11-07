import { OrderItem } from "sequelize";
import { CommonSortItem, SortOption } from "../types/sort.type.js";
import dayjs from "dayjs";

export interface CreatePageOption<T> {
  count?: number;
  page?: number;
  sort?: string;
  defaultValue: T;
  isSortItem: (item: any) => item is T;
}

export interface PageOptions<T> {
  page: number;
  count: number;
  sort: T;
}

export const createPageOptions = <T>(data: CreatePageOption<T>): PageOptions<T> => {
  const page: number = !isNaN(Number(data.page)) ? Number(data.page) : 1;
  const count: number = !isNaN(Number(data.count)) ? Number(data.count) : 10;
  const sort: T = data.isSortItem(data.sort) ? data.sort : data.defaultValue;

  const result: PageOptions<T> = {
    page: page,
    count: count,
    sort: sort
  };

  return result;
};

export const createSortOptions = <T extends string>(sortItem: T, options: SortOption<T | CommonSortItem>): OrderItem => {
  const option = options[sortItem];
  return option || options.r;
};

export const convertStringtoDate = ({ strStartDate, strEndDate }: { strStartDate?: any; strEndDate?: any }) => {
  if (!strStartDate || !strEndDate) {
    return {
      fromDate: undefined,
      toDate: undefined
    };
  }

  return {
    fromDate: dayjs(String(strStartDate)).startOf("day").utc(true).toDate(),
    toDate: dayjs(String(strEndDate)).endOf("day").utc(true).toDate()
  };
};
