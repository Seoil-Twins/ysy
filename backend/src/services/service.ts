import { Transaction } from "sequelize";

export abstract class Service {
  abstract getURL(...args: any[]): string;
  abstract select(...args: any[]): Promise<any>;
  abstract create(transaction: Transaction | null, ...args: any[]): Promise<any>;
  abstract update(transaction: Transaction | null, ...args: any[]): Promise<any>;
  abstract delete(transaction: Transaction | null, ...args: any[]): Promise<any>;
}
