import { SolutionImage } from "../models/solutionImage.model.js";

export interface ResponseSolutionImageWithAdmin {
  images: SolutionImage[];
  total: number;
}

export interface PageOptions {
  count: number;
  page: number;
  sort: string | "r" | "o";
}

export interface SearchOptions {
  solutionId?: number;
}

export interface FilterOptions {
  fromDate?: Date;
  toDate?: Date;
}
