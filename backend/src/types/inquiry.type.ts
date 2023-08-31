import { Inquiry } from "../models/inquiry.model";

export interface CreateInquiry {
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
  sort: string | "r" | "o" | "sr" | "so";
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
