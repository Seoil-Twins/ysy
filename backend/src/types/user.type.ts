import { User } from "../models/user.model";

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
  code?: string;
  birthday: Date;
  phone: string;
  profile?: string | null;
  primaryNofi: boolean;
  dateNofi: boolean;
  eventNofi: boolean;
  coupleNofi: boolean;
  albumNofi: boolean;
  calendarNofi: boolean;
  role: number;
}

export interface UpdateUser {
  name?: string;
  phone?: string;
  profile?: string | null;
}

export interface UpdateUserNotification {
  primaryNofi?: boolean;
  dateNofi?: boolean;
  eventNofi?: boolean;
  coupleNofi?: boolean;
  albumNofi?: boolean;
  calendarNofi?: boolean;
}

export interface UpdateUserWithAdmin {
  email?: string;
  name?: string;
  code?: string;
  birthday?: Date;
  phone?: string;
  profile?: string | null;
  primaryNofi?: boolean;
  dateNofi?: boolean;
  eventNofi?: boolean;
  coupleNofi?: boolean;
  albumNofi?: boolean;
  calendarNofi?: boolean;
  deleted?: boolean;
  deletedTime?: Date;
  role?: number;
}

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

export interface ResponseUserWithAdmin {
  userId: number;
  cupId: string | null;
  snsId: string;
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
  delete: boolean;
  deletedTime: Date;
  couple: User | undefined;
}

export interface PageOptions {
  count: number;
  page: number;
  sort: string | "na" | "nd" | "r" | "o" | "dr" | "do";
}

export interface SearchOptions {
  name?: string;
  snsId?: string;
}

export interface FilterOptions {
  isCouple: boolean;
  isDeleted: boolean;
}
