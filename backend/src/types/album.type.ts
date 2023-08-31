import { AlbumImage } from "../models/albnmImage.model";
import { Album } from "../models/album.model";

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
  sort: string | "r" | "o" | "cd" | "ca";
}

export interface SearchOptions {
  cupId?: string;
}

export interface FilterOptions {
  fromDate?: Date;
  toDate?: Date;
}
