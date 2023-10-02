import { SortItem as AlbumSortItem } from "./album.type.js";
import { SortItem as UserSortItem } from "./user.type.js";
import { SortItemWithAdmin as InquirySortItem } from "./inquiry.type.js";
import { SortItem as CoupleSortItem } from "./couple.type.js";

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
  nd: ["name", "DESC"]
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
  im: ["total", "DESC"]
};

export const inquirySortOptions: SortOption<InquirySortItem> = {
  ...commonSortOptions,
  so: ["solution", "ASC"],
  sr: ["solution", "DESC"]
};
