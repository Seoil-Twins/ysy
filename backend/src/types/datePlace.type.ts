import { DatePlace } from "../models/datePlace.model.js";

export type ResponseItem = DatePlace & {
  isFavorite: boolean;
  isView: boolean;
};

export interface ResponseDatePlace {
  results: ResponseItem[];
  total: number;
}

export const isSortItem = (item: any): item is SortItem => {
  return ["r", "f", "t"].includes(item);
};

export type SortItem = "r" | "f" | "t";

export interface PageOptions {
  count: number;
  page: number;
  sort: SortItem;
}

export interface SearchOptions {
  areaCode: string;
  sigunguCode?: string;
}

export interface FilterOptions {
  kind?: string;
}
