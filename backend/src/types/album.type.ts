import { AlbumImage } from "../models/albumImage.model";
import { Album } from "../models/album.model";

export const isSortItem = (item: any): item is SortItem => {
  return ["r", "o", "cd", "ca"].includes(item);
};

export type SortItem = "r" | "o" | "cd" | "ca";

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

export interface PageOptions {
  count: number;
  page: number;
  sort: SortItem;
}

export interface SearchOptions {
  cupId?: string;
}

export interface FilterOptions {
  fromDate?: Date;
  toDate?: Date;
}
