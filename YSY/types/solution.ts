import { SolutionImage } from './solutionImage';

export interface Solution {
  solutionId: number;
  title: string;
  contents: string;
  createdTime: string;
  solutionImages?: SolutionImage[];
}
