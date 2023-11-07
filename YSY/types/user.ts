export interface User {
  userId: number;
  cupId: string | null;
  snsId: string;
  snsKind: string;
  code: string;
  name: string;
  email: string;
  birthday: string;
  phone: string;
  profile?: string | null;
  primaryNofi: boolean;
  dateNofi: boolean;
  eventNofi: boolean;
}
