import { Transaction } from "sequelize";

export abstract class Service {
    abstract select(...args: any[]): Promise<any>;
    abstract create(transaction: Transaction, ...args: any[]): Promise<any>;
    abstract update(transaction: Transaction, ...args: any[]): Promise<any>;
    abstract delete(transaction: Transaction, ...args: any[]): Promise<any>;
}
