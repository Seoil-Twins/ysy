import { Notice } from "../models/notice.model";

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
  sort: string | "r" | "o";
}

export interface FilterOptions {
  fromDate?: Date;
  toDate?: Date;
}
