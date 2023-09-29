import { OrderItem } from "sequelize";

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

export const createPageOption = <T>(data: CreatePageOption<T>): PageOptions<T> => {
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

export const createSortOptions = (sort: string): OrderItem => {
  let result: OrderItem = ["createdTime", "DESC"];

  switch (sort) {
    case "r":
      result = ["createdTime", "DESC"];
      break;
    case "o":
      result = ["createdTime", "ASC"];
      break;
    case "f":
      result = ["views", "DESC"];
      break;
    case "t":
      result = ["title", "ASC"];
      break;
    case "cd":
      result = ["cupId", "DESC"];
      break;
    case "ca":
      result = ["cupId", "ASC"];
      break;
    case "il":
      result = ["total", "ASC"];
      break;
    case "im":
      result = ["total", "DESC"];
      break;
    case "na":
      result = ["name", "ASC"];
      break;
    case "nd":
      result = ["name", "DESC"];
      break;
    case "do":
      result = ["deletedTime", "ASC"];
      break;
    case "dr":
      result = ["deletedTime", "DESC"];
      break;
    default:
      result = ["createdTime", "DESC"];
      break;
  }

  return result;
};
