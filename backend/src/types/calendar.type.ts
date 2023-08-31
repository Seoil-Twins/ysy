import { Calendar } from "../models/calendar.model";

export interface CreateCalendar {
  title: string;
  description: string;
  fromDate: Date;
  toDate: Date;
  color: string;
}

export interface UpdateCalendar extends Partial<CreateCalendar> {}

export interface ResponseCalendar {
  calendars: Calendar[];
}

export interface ResponseCalendarWithAdmin {
  calendars: Calendar[];
  total: number;
}

export interface PageOptions {
  count: number;
  page: number;
  sort: string | "r" | "o" | "ya" | "yo";
}

export interface SearchOptions {
  cupId?: string;
}

export interface FilterOptions {
  /** year-01-01부터 year-12-31까지  */
  year: number;
  /** created_time 기준으로 from부터 to까지 */
  fromDate?: Date;
  /** created_time 기준으로 from부터 to까지 */
  toDate?: Date;
  /** calendar 기준으로 from부터 to까지 */
  fromClrDate?: Date;
  /** calendar 기준으로 from부터 to까지 */
  toClrDate?: Date;
}
