import { Inquiry } from "../models/inquiry.model.js";

export const isSortItem = (item: any): item is SortItem => {
  return ["r", "o", "sr", "so"].includes(item);
};

export type SortItem = "r" | "o" | "sr" | "so";

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
