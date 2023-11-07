import { Inquiry } from "../models/inquiry.model.js";
import { CommonSortItem, commonSortItems } from "./sort.type.js";

export type SortItem = "r";
export type SortItemWithAdmin = CommonSortItem | "sr" | "so";
export const isSortItem = (item: any): item is SortItem => commonSortItems.includes(item) || ["sr", "so"].includes(item);

export interface CreateInquiry {
  userId: number;
  title: string;
  contents: string;
}

export interface ResponseInquiry {
  inquires: Inquiry[];
  total: number;
}

export interface PageOptions {
  count: number;
  page: number;
  sort: SortItem;
}

export interface SearchOptions {
  userId?: number;
}

export interface FilterOptions {
  fromDate?: Date;
  toDate?: Date;
  isSolution?: boolean;
  hasImage?: boolean;
}
