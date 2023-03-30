import dayjs from "dayjs";
import { boolean } from "boolean";
import { File } from "formidable";
import { Op, OrderItem, Transaction, WhereOptions } from "sequelize";

import { API_ROOT } from "..";
import { Service } from "./service";

import { isDefaultFile, uploadFile } from "../util/firebase.util";

import {IRestaurantResponseWithCount, PageOptions, SearchOptions, Restaurant } from "../model/restaurant.model";

class RestaurantAdminService extends Service {
    create(transaction: Transaction | null, ...args: any[]): Promise<any> {
        throw new Error("Method not implemented.");
    }
    update(transaction: Transaction | null, ...args: any[]): Promise<any> {
        throw new Error("Method not implemented.");
    }
    delete(transaction: Transaction | null, ...args: any[]): Promise<any> {
        throw new Error("Method not implemented.");
    }
    private FOLDER_NAME = "restaurant";

    private createSort(sort: string): OrderItem {
        let result: OrderItem = ["title", "ASC"];

        switch (sort) {
            case "ta":
                result = ["title", "ASC"];
                break;
            case "td":
                result = ["title", "DESC"];
                break;
            case "r":
                result = ["createdTime", "DESC"];
                break;
            case "o":
                result = ["createdTime", "ASC"];
                break;
            default:
                result = ["title", "ASC"];
                break;
        }

        return result;
    }

    private createWhere(searchOptions: SearchOptions): WhereOptions {
        let result: WhereOptions = {};
        console.log(searchOptions.contentId);
        if (searchOptions.contentId && searchOptions.contentId !== "undefined") result["contentId"] =  searchOptions.contentId;
        if (searchOptions.title && searchOptions.title !== "undefined") result["title"] = { [Op.substring]: `%${searchOptions.title}%` };
        if (searchOptions.contentId == "undefined" && searchOptions.title == "undefined") result = {};

        return result;
    }

    getURL(): string {
        return `${API_ROOT}/admin/user?page=1&count=1&sort=r`;
    }

    async select(pageOptions: PageOptions, searchOptions: SearchOptions): Promise<Restaurant[]> {
        try{
            const sort: OrderItem = this.createSort(pageOptions.sort);
            const where: WhereOptions = this.createWhere(searchOptions);

            const result: Restaurant[] = await Restaurant.findAll({
                order: [sort],
                where
            });
            return result;
        } catch(err){
            console.log("err : ",err);
            throw err;
        }
    }

}

export default RestaurantAdminService;
