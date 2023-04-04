import { Op, OrderItem, Transaction, WhereOptions } from "sequelize";
import { Service } from "./service";
import { Calendar, FilterOptions, ICalendarResponseWithCount, PageOptions, SearchOptions } from "../model/calendar.model";
import dayjs from "dayjs";

class CalendarAdminService extends Service {
    private createSort(sort: string): OrderItem {
        let result: OrderItem = ["createdTime", "DESC"];

        switch (sort) {
            case "r":
                result = ["createdTime", "DESC"];
                break;
            case "o":
                result = ["createdTime", "ASC"];
                break;
            case "yr":
                result = ["fromDate", "DESC"];
                break;
            case "yo":
                result = ["fromDate", "ASC"];
                break;
            default:
                result = ["createdTime", "DESC"];
                break;
        }

        return result;
    }

    private createWhere(searchOptions: SearchOptions, filterOptions: FilterOptions): WhereOptions<Calendar> {
        let result: WhereOptions<Calendar> = {};
        const startDate = dayjs(`${filterOptions.year}-01-01`).startOf("day").format("YYYY-MM-DD HH:mm:ss");
        const endDate = dayjs(`${filterOptions.year}-12-31`).startOf("day").format("YYYY-MM-DD HH:mm:ss");
        result.fromDate = { [Op.between]: [startDate, endDate] };
        result.toDate = { [Op.between]: [startDate, endDate] };

        if (searchOptions.cupId) result.cupId = { [Op.like]: `%${searchOptions.cupId}%` };
        if (filterOptions.fromDate && filterOptions.toDate) result.createdTime = { [Op.between]: [filterOptions.fromDate, filterOptions.toDate] };
        if (filterOptions.fromClrDate && filterOptions.toClrDate) {
            result.fromDate = {
                [Op.gt]: filterOptions.fromClrDate,
                [Op.lt]: filterOptions.toClrDate
            };
        }

        return result;
    }

    getURL(...args: any[]): string {
        throw new Error("Method not implemented.");
    }

    async select(pageOptions: PageOptions, searchOptions: SearchOptions, filterOptions: FilterOptions): Promise<ICalendarResponseWithCount> {
        const offset: number = (pageOptions.page - 1) * pageOptions.count;
        const sort: OrderItem = this.createSort(pageOptions.sort);
        const where: WhereOptions<Calendar> = this.createWhere(searchOptions, filterOptions);
        const { rows, count }: { rows: Calendar[]; count: number } = await Calendar.findAndCountAll({
            where,
            offset,
            limit: pageOptions.count,
            order: [sort]
        });
        const result: ICalendarResponseWithCount = {
            calendars: rows,
            count: count
        };

        return result;
    }

    create(transaction: Transaction | null, ...args: any[]): Promise<any> {
        throw new Error("Method not implemented.");
    }

    update(transaction: Transaction | null, ...args: any[]): Promise<any> {
        throw new Error("Method not implemented.");
    }

    delete(transaction: Transaction | null, ...args: any[]): Promise<any> {
        throw new Error("Method not implemented.");
    }
}

export default CalendarAdminService;
