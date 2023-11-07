import { AlbumImage } from "../models/albumImage.model.js";
import { Album } from "../models/album.model.js";
import { CommonSortItem, commonSortItems } from "./sort.type.js";

export type SortItem = CommonSortItem | "t" | "im" | "il" | "sb" | "ss";
export const isSortItem = (item: any): item is SortItem => commonSortItems.includes(item) || ["t", "im", "il", "sb", "ss"].includes(item);

export interface ResponseAlbumFolder {
  albums: Album[];
  total: number;
}

export interface ResponseAlbum {
  albumId: number;
  cupId: string;
  title: string;
  thumbnail: string | null;
  createdTime: Date;
  images: AlbumImage[];
  total: number;
}

export interface SearchOptions {
  cupId?: string;
}

export interface FilterOptions {
  fromDate?: Date;
  toDate?: Date;
  isThumbnail?: boolean;
}
