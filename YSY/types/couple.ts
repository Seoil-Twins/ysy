import { User } from './user';

export interface Couple {
  cupId: string;
  cupDay: string;
  title: string;
  thumbnail: string | null;
  createdTime: string;
  users: Array<User>;
}
