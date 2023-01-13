export default abstract class AbstractSQL {
    tableName: string;

    constructor(tableName: string) {
        this.tableName = tableName;
    }

    abstract create(data: any): any;
    abstract find(options: any): Promise<any[]>;
    abstract add(iData: any): Promise<void>;
    abstract update(iData: any, options: any): Promise<void>;
    abstract delete(iData: any): Promise<void>;
}
