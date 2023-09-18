import { Notice } from "../models/notice.model.js";

export const isSortItem = (item: any): item is SortItem => {
  return ["r", "o"].includes(item);
};

export type SortItem = "r" | "o";

export interface CreateNoticeWithAdmin {
  title: string;
  contents: string;
}

export interface UpdateNoticeWithAdmin extends Partial<CreateNoticeWithAdmin> {}

export interface ResponseNotice {
  notices: Notice[];
  total: number;
}

export interface PageOptions {
  count: number;
  page: number;
  sort: SortItem;
}

export interface FilterOptions {
  fromDate?: Date;
  toDate?: Date;
}
