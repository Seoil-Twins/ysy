import { InquiryImage } from "../models/inquiryImage.model.js";

export interface InquiryImageResponseWithCount {
  images: InquiryImage[];
  total: number;
}

export interface PageOptions {
  count: number;
  page: number;
  sort: string | "r" | "o";
}

export interface SearchOptions {
  inquiryId?: number;
}

export interface FilterOptions {
  fromDate?: Date;
  toDate?: Date;
}
