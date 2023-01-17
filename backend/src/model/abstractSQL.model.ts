import { PoolConnection } from "mysql2/promise";

export default abstract class AbstractSQL {
    tableName: string;

    constructor(tableName: string) {
        this.tableName = tableName;
    }

    abstract create(data: any): any;
    abstract find(conn: PoolConnection, options: any): Promise<any[]>;
    abstract add(conn: PoolConnection, iData: any): Promise<void>;
    abstract update(conn: PoolConnection, iData: any, options: any): Promise<void>;
    abstract delete(conn: PoolConnection, iData: any): Promise<void>;
}
