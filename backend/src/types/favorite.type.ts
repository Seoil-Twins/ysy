import { DatePlace } from "../models/datePlace.model.js";
import { DatePlaceView } from "../models/datePlaceView.model.js";
import { Favorite } from "../models/favorite.model.js";
import { CommonSortItem, commonSortItems } from "./sort.type.js";

export const isSortItem = (item: any): item is SortItem => {
  return commonSortItems.includes(item);
};

export type SortItem = CommonSortItem;

export type ResponseDatePlaceItem = DatePlace & {
  isView: boolean;
};

export type ResponseItem = Favorite & {
  contentId?: number;
  contentTypeId?: number;
  datePlace: ResponseDatePlaceItem;
};

export interface ResponseFavorite {
  favorites: Favorite[];
  total: number;
}

export interface PageOptions {
  count: number;
  page: number;
  sort: SortItem;
}

export interface RequestFavorite {
  userId: number;
  contentId: string;
  contentTypeId: string;
}
