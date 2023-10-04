import { User } from "../models/user.model.js";
import { CommonSortItem, commonSortItems } from "./sort.type.js";

export type SortItem = CommonSortItem | "na" | "nd" | "dr" | "do" | "sb" | "ss";
export const isSortItem = (item: any): item is SortItem => commonSortItems.includes(item) || ["na", "nd", "dr", "do", "sb", "ss"].includes(item);

export interface CreateUser {
  snsId: string;
  snsKind: string;
  email: string;
  name: string;
  phone: string;
  birthday: Date;
  eventNofi: boolean;
}

export interface CreateUserWithAdmin {
  snsId: string;
  snsKind: string;
  email: string;
  name: string;
  code: string;
  birthday: Date;
  phone: string;
  primaryNofi: boolean;
  dateNofi: boolean;
  eventNofi: boolean;
  coupleNofi: boolean;
  albumNofi: boolean;
  calendarNofi: boolean;
  deleted: boolean;
  deletedTime?: Date | null;
  role: number;
  password?: string;
}

export interface UpdateUser {
  name?: string;
  phone?: string;
}

export interface UpdateUserNotification {
  primaryNofi?: boolean;
  dateNofi?: boolean;
  eventNofi?: boolean;
  coupleNofi?: boolean;
  albumNofi?: boolean;
  calendarNofi?: boolean;
}

export type UpdateUserWithAdmin = Partial<CreateUserWithAdmin>;

export interface ResponseUser {
  userId: number;
  cupId: string | null;
  snsKind: string;
  email: string;
  name: string;
  code: string;
  birthday: Date;
  phone: string;
  profile: string | null;
  primaryNofi: boolean;
  dateNofi: boolean;
  eventNofi: boolean;
  coupleNofi: boolean;
  albumNofi: boolean;
  calendarNofi: boolean;
  createdTime: Date;
  couple: User | undefined;
}

export interface ResponseUsersWithAdmin {
  users: User[];
  total: number;
}

export interface SearchOptions {
  name?: string;
  snsKind?: string;
}

export interface FilterOptions {
  fromDate?: Date;
  toDate?: Date;
  isProfile: boolean;
  isCouple: boolean;
  isDeleted: boolean;
}
