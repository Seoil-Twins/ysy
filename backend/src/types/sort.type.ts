import { SortItem as AlbumSortItem } from "./album.type.js";
import { SortItem as UserSortItem } from "./user.type.js";
import { SortItemWithAdmin as InquirySortItem } from "./inquiry.type.js";
import { SortItem as CoupleSortItem } from "./couple.type.js";
import { SortItem as AlbumImageSortItem } from "./albumImage.type.js";

type Sort = "ASC" | "DESC";
type SortSyntax = [string, Sort];

export type SortOption<T extends string> = Record<T, SortSyntax>;

export type CommonSortItem = "r" | "o";
export const commonSortItems: CommonSortItem[] = ["r", "o"];

export const commonSortOptions: SortOption<CommonSortItem> = {
  r: ["createdTime", "DESC"],
  o: ["createdTime", "ASC"]
};

export const userSortOptions: SortOption<UserSortItem> = {
  ...commonSortOptions,
  do: ["deletedTime", "ASC"],
  dr: ["deletedTime", "DESC"],
  na: ["name", "ASC"],
  nd: ["name", "DESC"],
  sb: ["profileSize", "DESC"],
  ss: ["profileSize", "ASC"]
};

export const coupleSortOptions: SortOption<CoupleSortItem> = {
  ...commonSortOptions,
  do: ["deletedTime", "ASC"],
  dr: ["deletedTime", "DESC"],
  sb: ["thumbnailSize", "DESC"],
  ss: ["thumbnailSize", "ASC"]
};

export const albumSortOptions: SortOption<AlbumSortItem> = {
  ...commonSortOptions,
  t: ["title", "ASC"],
  il: ["total", "ASC"],
  im: ["total", "DESC"],
  sb: ["thumbnailSize", "DESC"],
  ss: ["thumbnailSize", "ASC"]
};

export const albumImageSortOptions: SortOption<AlbumImageSortItem> = {
  ...commonSortOptions,
  sb: ["size", "DESC"],
  ss: ["size", "ASC"]
};

export const inquirySortOptions: SortOption<InquirySortItem> = {
  ...commonSortOptions,
  so: ["solution", "ASC"],
  sr: ["solution", "DESC"]
};
