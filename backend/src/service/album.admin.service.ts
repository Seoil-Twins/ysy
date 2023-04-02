import { Op, OrderItem, Transaction, WhereOptions } from "sequelize";
import { Service } from "./service";
import { Album, FilterOptions, ICreate, ICreateWithAdmin, IUpdateWithAdmin, PageOptions, SearchOptions } from "../model/album.model";
import { AlbumImage } from "../model/albnmImage.model";
import sequelize from "../model";
import { File } from "formidable";
import { isDefaultFile, uploadFile } from "../util/firebase.util";
import dayjs from "dayjs";
import { API_ROOT } from "..";

class AlbumAdminService extends Service {
    private FOLDER_NAME = "couples";

    getURL(cupId: string): string {
        return `${API_ROOT}/admin/album?sort=r&count=10&page=1&cup_id=${cupId}`;
    }

    getAlbumFolderPath(cupId: string, albumId: number): string {
        return `${this.FOLDER_NAME}/${cupId}/${albumId}`;
    }

    private getAlbumThumbnailPath(cupId: string, albumId: number): string {
        return `${this.FOLDER_NAME}/${cupId}/${albumId}/thumbnail`;
    }

    private createSort(sort: string): OrderItem {
        let result: OrderItem = ["createdTime", "DESC"];

        switch (sort) {
            case "r":
                result = ["createdTime", "DESC"];
                break;
            case "o":
                result = ["createdTime", "ASC"];
                break;
            case "cd":
                result = ["cupId", "DESC"];
                break;
            case "ca":
                result = ["cupId", "ASC"];
                break;
            default:
                result = ["createdTime", "DESC"];
                break;
        }

        return result;
    }

    private createWhere(searchOptions: SearchOptions, filterOptions: FilterOptions): WhereOptions {
        let result: WhereOptions = {};

        if (searchOptions.cupId) result["cupId"] = { [Op.like]: `%${searchOptions.cupId}%` };
        if (filterOptions.fromDate && filterOptions.toDate) result["createdTime"] = { [Op.between]: [filterOptions.fromDate, filterOptions.toDate] };

        return result;
    }

    async select(pageOptions: PageOptions, searchOptions: SearchOptions, filterOptions: FilterOptions): Promise<[Album[], number]> {
        const offset: number = (pageOptions.page - 1) * pageOptions.count;
        const sort: OrderItem = this.createSort(pageOptions.sort);
        const where: WhereOptions = this.createWhere(searchOptions, filterOptions);

        const { rows }: { rows: Album[] } = await Album.findAndCountAll({
            where,
            offset,
            limit: pageOptions.count,
            order: [sort],
            attributes: { include: [[sequelize.fn("COUNT", sequelize.col("albumImages.album_id")), "total"]] },
            include: {
                model: AlbumImage,
                as: "albumImages",
                attributes: [],
                duplicating: false
            },
            group: "Album.album_id"
        });

        const count: number = await Album.count();

        return [rows, count];
    }

    async selectMutiple(albumIds: number[]): Promise<Album[]> {
        const albums: Album[] = await Album.findAll({ where: { albumId: albumIds } });
        return albums;
    }

    async create(transaction: Transaction | null, data: ICreate): Promise<Album> {
        const createdAlbum: Album = await Album.create(data, { transaction });
        return createdAlbum;
    }

    async update(transaction: Transaction | null, album: Album, data: IUpdateWithAdmin, thumbnail?: File): Promise<Album> {
        if (thumbnail) {
            const reqFileName = thumbnail.originalFilename!;
            const isDefault = isDefaultFile(reqFileName);

            if (isDefault) {
                data.thumbnail = null;
            } else {
                data.thumbnail = `${this.getAlbumThumbnailPath(album.cupId, album.albumId)}/${dayjs().valueOf()}.${reqFileName}`;
            }
        }

        const updatedAlbum: Album = await album.update(data, { transaction });
        if (thumbnail && data.thumbnail) await uploadFile(data.thumbnail, thumbnail.filepath);

        return updatedAlbum;
    }

    async updateThumbnail(transaction: Transaction | null, album: Album, thumbnail: File): Promise<Album> {
        let path: string | null = null;
        const reqFileName = thumbnail.originalFilename!;
        const isDefault = isDefaultFile(reqFileName);

        if (isDefault) {
            path = null;
        } else {
            path = `${this.getAlbumThumbnailPath(album.cupId, album.albumId)}/${dayjs().valueOf()}.${reqFileName}`;
        }

        const updatedAlbum: Album = await album.update({ thumbnail: path }, { transaction });
        if (path) await uploadFile(path, thumbnail.filepath);

        return updatedAlbum;
    }

    delete(transaction: Transaction | null, ...args: any[]): Promise<any> {
        throw new Error("Method not implemented.");
    }
}

export default AlbumAdminService;
