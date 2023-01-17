import dayjs from "dayjs";
import AbstractSQL from "./abstractSQL.model";
import { select, edit } from "../util/sql";
import { PoolConnection } from "mysql2/promise";

export const CoupleColumn = {
    cupId: "cup_id",
    cupDay: "cup_day",
    title: "title",
    thumbnail: "thumbnail",
    deleted: "deleted",
    deletedTime: "deleted_time"
} as const;

// -------------------------------------------- Interface ------------------------------------------ //
export interface ICouple {
    cupId: string;
    cupDay: Date;
    title: string;
    thumbnail: string;
    deleted: boolean;
    deletedTime: Date | null;
}

export interface ICreateData {
    // Auth Middleware User Id
    userId: number;
    userId2: number;
    cupId: string;
    title: string;
    thumbnail: string;
    cupDay: Date;
}
// ------------------------------------------ Interface End ---------------------------------------- //

// -------------------------------------------- Options -------------------------------------------- //
export interface SelectOption {
    columns?: string[] | undefined;
    where?: string | undefined;
    orderBy?: string | undefined;
    limit?: number | undefined;
}

export interface UpdateOption {
    where: string;
}
// ------------------------------------------ Options End ------------------------------------------ //

export class Couple implements ICouple {
    cupId: string;
    cupDay: Date;
    title: string;
    thumbnail: string;
    deleted: boolean = false;
    deletedTime: Date | null = null;

    constructor(data: ICouple) {
        this.cupId = data.cupId;
        this.cupDay = data.cupDay;
        this.title = data.title;
        this.thumbnail = data.thumbnail;
        this.deleted = Boolean(data.deleted);
        this.deletedTime = data.deletedTime;
    }
}

export class CoupleSQL extends AbstractSQL {
    constructor() {
        super("couple");
    }

    create(data: ICouple): Couple {
        return new Couple(data);
    }

    async find(conn: PoolConnection, options: SelectOption): Promise<any[]> {
        const response: any[] = await select(conn, this.tableName, options);
        let result: Couple[] = [];

        if (response.length > 0) {
            for (let i = 0; i < response.length; i++) {
                result.push(this.create(response[i]));
            }
        }

        return result;
    }

    async add(conn: PoolConnection, data: ICreateData): Promise<void> {
        const cupDay = dayjs(data.cupDay.valueOf()).format("YYYY-MM-DD");
        const sql = `
            INSERT INTO ${this.tableName}
                (
                    ${CoupleColumn.cupId}, ${CoupleColumn.cupDay}, ${CoupleColumn.title}, ${CoupleColumn.thumbnail}
                )
                VALUES
                (
                    "${data.cupId}", "${cupDay}", "${data.title}", "${data.thumbnail}"
                );
        `;

        await edit(conn, sql);
    }

    update(conn: PoolConnection, iData: any, options: any): Promise<void> {
        throw new Error("Method not implemented.");
    }

    delete(conn: PoolConnection, iData: any): Promise<void> {
        throw new Error("Method not implemented.");
    }
}
