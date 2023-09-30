import { Couple } from "../models/couple.model.js";
import { User } from "../models/user.model.js";

import { CommonSortItem, commonSortItems } from "./sort.type.js";

export type SortItem = CommonSortItem | "do" | "dr" | "sb" | "ss";
export const isSortItem = (item: any): item is SortItem => commonSortItems.includes(item) || ["do", "dr", "sb", "ss"].includes(item);

export interface CreateCouple {
  otherCode: string;
  cupDay: Date;
}

export interface CreateCoupleWithAdmin {
  code: string;
  otherCode: string;
  cupDay: Date;
  deleted?: boolean;
  deletedTime?: Date;
}

export interface UpdateCouple {
  cupDay?: Date;
}

export interface UpdateCoupleWithAdmin {
  cupDay?: Date;
  thumbnail?: string | null;
  deleted?: boolean;
  deletedTime?: Date | null;
}

export interface ResponseCouple {
  cupId: string;
  cupDay: Date;
  thumbnail: string | null;
  createdTime: Date;
  users: User[];
}

export interface ResponseCouplesWithAdmin {
  couples: Couple[];
  total: number;
}

export interface PageOptions<T> {
  count: number;
  page: number;
  sort: T;
}

export interface SearchOptions {
  cupId?: string;
}

export interface FilterOptions {
  fromDate?: Date;
  toDate?: Date;
  isDeleted?: boolean;
  isThumbnail?: boolean;
}
