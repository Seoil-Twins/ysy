import { File } from "formidable";
import { Transaction } from "sequelize";

import ForbiddenError from "../error/forbidden";
import NotFoundError from "../error/notFound";

import sequelize from "../model";
import { Album, ICreate, IRequestGet, IRequestUpadteThumbnail, IRequestUpadteTitle, IResponse } from "../model/album.model";
import { AlbumImage } from "../model/albnmImage.model";

import logger from "../logger/logger";
import AlbumService from "../service/album.service";
import AlbumImageService from "../service/albumImage.service";

class AlbumController {
    private albumService: AlbumService;
    private albumImageService: AlbumImageService;

    constructor(albumService: AlbumService, albumImageService: AlbumImageService) {
        this.albumService = albumService;
        this.albumImageService = albumImageService;
    }

    async getAlbumsFolder(cupId: string): Promise<Album[]> {
        const albums: Album[] = await this.albumService.selectAll(cupId);
        if (!albums) throw new NotFoundError("Not found albums using token couple ID");

        return albums;
    }

    async getAlbums(data: IRequestGet): Promise<IResponse> {
        const album: Album | null = await this.albumService.select(data.albumId);
        if (!album) throw new NotFoundError("Not Found Albums");

        const { rows, count }: { rows: AlbumImage[]; count: number } = await this.albumImageService.selectCountWithTotal(data.albumId, data.page, data.count);

        const result: IResponse = {
            ...album.dataValues,
            images: rows,
            total: count
        };

        return result;
    }

    async addAlbumFolder(data: ICreate): Promise<string> {
        const album: Album = await this.albumService.create(null, data);
        logger.debug(`Create Data => ${JSON.stringify(album.dataValues)}`);

        const url: string = this.albumService.getFolderUrl(data.cupId);
        return url;
    }

    async addImages(cupId: string, albumId: number, images: File | File[]): Promise<string> {
        const albumFolder: Album | null = await this.albumService.select(albumId);
        if (!albumFolder) throw new NotFoundError("Not found album using query parameter album ID");
        else if (albumFolder.cupId !== cupId) throw new ForbiddenError("The ID of the album folder and the body ID don't match.");

        let transaction: Transaction | undefined = undefined;

        try {
            transaction = await sequelize.transaction();

            if (images instanceof Array<File>) await this.albumImageService.createMutiple(transaction, cupId, albumId, images);
            else if (images instanceof File) await this.albumImageService.create(transaction, cupId, albumId, images);

            await transaction.commit();
            logger.debug(`Success add albums => ${cupId} | ${albumId} | ${JSON.stringify(images)}`);

            const url: string = this.albumService.getAlbumUrl(cupId, albumId);
            return url;
        } catch (error) {
            if (transaction) await transaction.rollback();

            logger.error(`Album Create Error ${JSON.stringify(error)}`);
            throw error;
        }
    }

    async updateTitle(data: IRequestUpadteTitle): Promise<Album> {
        const albumFolder = await this.albumService.select(data.albumId);
        if (!albumFolder) throw new NotFoundError("Not found album using query parameter album ID");
        else if (albumFolder.cupId !== data.cupId) throw new ForbiddenError("The ID of the album folder and the body ID don't match.");

        let transaction: Transaction | undefined = undefined;

        try {
            transaction = await sequelize.transaction();

            const updatedAlbum: Album = await this.albumService.updateTitle(transaction, albumFolder, data.title);

            await transaction.commit();
            logger.debug(`Album update data => ${JSON.stringify(data)}`);

            return updatedAlbum;
        } catch (error) {
            if (transaction) await transaction.rollback();

            logger.error(`Album update title error => ${JSON.stringify(error)}`);
            throw error;
        }
    }

    async updateThumbnail(data: IRequestUpadteThumbnail, thumbnail: File): Promise<Album> {
        const albumFolder: Album | null = await this.albumService.select(data.albumId);
        if (!albumFolder) throw new NotFoundError("Not found album using query parameter album ID");
        else if (albumFolder.cupId !== data.cupId) throw new ForbiddenError("The ID of the album folder and the body ID don't match.");

        let transaction: Transaction | undefined = undefined;

        try {
            transaction = await sequelize.transaction();

            const updatedAlbum: Album = await this.albumService.updateThumbnail(transaction, albumFolder, thumbnail);

            await transaction.commit();
            logger.debug(`Update Data => ${JSON.stringify(data)}`);

            return updatedAlbum;
        } catch (error) {
            if (transaction) await transaction.rollback();

            logger.error(`Album update thumbnail error => ${JSON.stringify(error)}`);
            throw error;
        }
    }

    async deleteAlbum(cupId: string, albumId: number): Promise<void> {
        const albumFolder = await this.albumService.select(albumId);
        if (!albumFolder) throw new NotFoundError("Not found album using query parameter album ID");
        else if (albumFolder.cupId !== cupId) throw new ForbiddenError("The ID of the album folder and the body ID don't match.");

        let transaction: Transaction | undefined = undefined;

        try {
            transaction = await sequelize.transaction();

            await this.albumService.delete(transaction, albumFolder);
            await transaction.commit();
            logger.debug(`Success Deleted albums => ${cupId}, ${albumId}`);
        } catch (error) {
            if (transaction) await transaction.rollback();

            logger.error(`Delete album error => ${JSON.stringify(error)}`);
            throw error;
        }
    }

    async deleteAlbumImages(cupId: string, albumId: number, imageIds: number[]): Promise<void> {
        const albumFolder: Album | null = await this.albumService.select(albumId);
        if (!albumFolder) throw new NotFoundError("Not found album using query parameter album ID");
        else if (albumFolder.cupId !== cupId) throw new ForbiddenError("The ID of the album folder and the body ID don't match.");

        const images: AlbumImage[] = await this.albumImageService.select(imageIds);
        if (!images.length || images.length <= 0) throw new NotFoundError("Not found images");

        const paths = images.map((image: AlbumImage) => {
            return image.image;
        });

        let transaction: Transaction | undefined = undefined;

        try {
            transaction = await sequelize.transaction();

            await this.albumImageService.delete(transaction, imageIds, paths);
            await transaction.commit();
        } catch (error) {
            logger.error(`Delete album error => ${JSON.stringify(error)}`);
            if (transaction) await transaction.rollback();

            throw error;
        }
    }
}

export default AlbumController;
