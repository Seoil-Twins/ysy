import { OrderItem } from "sequelize";
import { CommonSortItem, SortOption } from "../types/sort.type.js";

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

export const createSortOptions = <T extends string>(sortItem: T, options: SortOption<T | CommonSortItem>): OrderItem => {
  const option = options[sortItem];
  return option || options.r;
};
