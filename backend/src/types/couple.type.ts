import { Couple } from "../models/couple.model";
import { User } from "../models/user.model";

export interface CreateCouple {
  otherCode: number;
  cupDay: Date;
  thumbnail?: string | null;
}

export interface UpdateCouple {
  cupDay?: Date;
}

export interface UpdateCoupleWithAdmin {
  cupDay?: Date;
  thumbnail?: string | null;
  deleted?: boolean;
  deletedTime?: Date;
}

export interface ResponseCouple {
  cupId: string;
  cupDay: Date;
  thumbnail: string | null;
  createdTime: Date;
  users: User[];
}

export interface ResponseCoupleWithAdmin {
  couples: Couple[];
  total: number;
}

export interface ResponseCouplesWithAdmin {
  cupId: string;
  cupDay: Date;
  thumbnail: string | null;
  createdTime: Date;
  deleted: boolean;
  deletedTime: Date;
  users: User[];
}

export interface PageOptions {
  count: number;
  page: number;
  sort: string | "r" | "o" | "dr" | "do";
}

export interface SearchOptions {
  name?: string;
}

export interface FilterOptions {
  fromDate?: Date;
  toDate?: Date;
  isDeleted: boolean;
}
