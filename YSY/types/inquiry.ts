import { InquiryImage } from './inquiryImage';
import { Solution } from './solution';

export interface Inquiry {
  inquireId: number;
  userId: number;
  title: string;
  contents: string;
  createdTime: string;
  inquireImages?: InquiryImage[];
  solution?: Solution;
}
