import { Solution } from "../models/solution.model.js";

export interface CreateSolutionWithAdmin {
  title: string;
  contents: string;
}

export interface UpdateSolutionWithAdmin extends Partial<CreateSolutionWithAdmin> {}

export interface ResponseSolutionWithAdmin {
  solutions: Solution[];
  total: number;
}

export interface PageOptions {
  count: number;
  page: number;
  sort: string | "r" | "o";
}

export interface SearchOptions {
  userId?: number;
  username?: string;
  title?: string;
}

export interface FilterOptions {
  fromDate?: Date;
  toDate?: Date;
  hasImage?: boolean;
}
