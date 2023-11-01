import { AlbumImage } from "../models/albumImage.model.js";
import { CommonSortItem, commonSortItems } from "./sort.type.js";

export type ImageType = "png" | "svg" | "jpeg" | "etc";
export const isImageType = (item: any): item is ImageType => ["svg", "png", "jpeg", "etc"].includes(item);

export type SortItem = CommonSortItem | "sb" | "ss";
export const isSortItem = (item: any): item is SortItem => commonSortItems.includes(item) || ["sb", "ss"].includes(item);

export interface ResponseAlbumImage {
  albumImages: AlbumImage[];
  total: number;
}

export interface SearchOptions {
  albumId?: number;
  cupId?: string;
  type?: ImageType;
}

export interface FilterOptions {
  fromDate?: Date;
  toDate?: Date;
}
