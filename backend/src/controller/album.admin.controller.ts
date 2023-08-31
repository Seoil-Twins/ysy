import { File } from "formidable";
import { Transaction } from "sequelize";

import NotFoundError from "../errors/notFound.error";

import sequelize from "../models";
import { Album, IAlbumResponseWithCount, SearchOptions, PageOptions, FilterOptions, ICreateWithAdmin, IUpdateWithAdmin } from "../models/album.model";
import { AlbumImage } from "../models/albnmImage.model";

import logger from "../logger/logger";
import { deleteFile, deleteFiles, deleteFolder } from "../utils/firebase.util";

import AlbumAdminService from "../services/album.admin.service";
import AlbumService from "../services/album.service";
import AlbumImageService from "../services/albumImage.service";

class AlbumAdminController {
    private albumService: AlbumService;
    private albumAdminService: AlbumAdminService;
    private albumImageService: AlbumImageService;

    constructor(albumService: AlbumService, albumAdminService: AlbumAdminService, albumImageService: AlbumImageService) {
        this.albumService = albumService;
        this.albumAdminService = albumAdminService;
        this.albumImageService = albumImageService;
    }

    /**
     * 모든 Album Folder를 가져옵니다.
     * ```typescript
     * const pageOptions: PageOptions = {
     *      count: 10,
     *      page: 1,
     *      sort: "r" | "o" | "cd" | "ca"
     * };
     * const searchOptions: SearchOptions = {
     *      cupId: "AAABBB"
     * };
     * const filterOptions: FilterOptions = {
     *      fromDate: "2023-03-01",
     *      toDate: "2023-03-03"
     * };
     *
     * const result: IAlbumResponseWithCount = await albumAdminController.getAlbumFolders(pageOptions, searchOptions, filterOptions);
     * ```
     * @param pageOptions {@link PageOptions}
     * @param searchOptions {@link SearchOptions}
     * @param filterOptions {@link FilterOptions}
     * @returns A {@link IAlbumResponseWithCount}
     */
    async getAlbumFolders(pageOptions: PageOptions, searchOptions: SearchOptions, filterOptions: FilterOptions): Promise<IAlbumResponseWithCount> {
        const [albums, count]: [Album[], number] = await this.albumAdminService.select(pageOptions, searchOptions, filterOptions);
        const result: IAlbumResponseWithCount = {
            albums,
            total: count
        };

        if (result.albums.length <= 0) throw new NotFoundError(`Not found albums`);
        return result;
    }

    async createAlbum(data: ICreateWithAdmin, thumbnail?: File, images?: File | File[]): Promise<string> {
        let createdAlbum: Album | undefined = undefined;
        let updatedAlbum: Album | undefined = undefined;
        let createdImages: AlbumImage | AlbumImage[] | undefined = undefined;
        let transaction: Transaction | undefined = undefined;

        try {
            transaction = await sequelize.transaction();

            if (thumbnail) {
                createdAlbum = await this.albumAdminService.create(transaction, data);
                updatedAlbum = await this.albumAdminService.updateThumbnail(transaction, createdAlbum, thumbnail);
            } else {
                createdAlbum = await this.albumAdminService.create(transaction, data);
            }

            if (images instanceof Array<File>) {
                createdImages = await this.albumImageService.createMutiple(transaction, data.cupId, createdAlbum.albumId, images);
            } else if (images instanceof File) {
                createdImages = await this.albumImageService.create(transaction, data.cupId, createdAlbum.albumId, images);
            }

            await transaction.commit();

            const url: string = this.albumAdminService.getURL(createdAlbum.cupId);
            return url;
        } catch (error) {
            logger.error(`Album Create Error ${JSON.stringify(error)}`);

            if (updatedAlbum?.thumbnail) await deleteFile(updatedAlbum.thumbnail);
            if (createdAlbum && createdImages) await deleteFolder(`${this.albumAdminService.getAlbumFolderPath(createdAlbum.cupId, createdAlbum.albumId)}`);
            if (transaction) await transaction.rollback();
            throw error;
        }
    }

    async addImages(albumId: number, images: File | File[]): Promise<string> {
        let albumImages: AlbumImage | AlbumImage[] | null = null;
        const album: Album | null = await this.albumService.select(albumId);
        if (!album) throw new NotFoundError("Not found album using query parameter album ID");

        let transaction: Transaction | undefined = undefined;

        try {
            transaction = await sequelize.transaction();

            if (images instanceof Array<File>) albumImages = await this.albumImageService.createMutiple(transaction, album.cupId, albumId, images);
            else if (images instanceof File) albumImages = await this.albumImageService.create(transaction, album.cupId, albumId, images);

            await transaction.commit();
            logger.debug(`Success add albums => ${album.cupId} | ${albumId} | ${JSON.stringify(images)}`);

            const url: string = this.albumAdminService.getURL(album.cupId);
            return url;
        } catch (error) {
            if (albumImages && albumImages instanceof AlbumImage) {
                await deleteFile(albumImages.image);
                logger.error(`After updating the firebase, a db error occurred and the firebase thumbnail is deleted => ${albumImages.image}`);
            } else if (albumImages && albumImages instanceof Array<AlbumImage>) {
                const paths: string[] = [];
                albumImages.forEach((image: AlbumImage) => {
                    paths.push(image.image);
                });

                await deleteFiles(paths);
                logger.error(`After updating the firebase, a db error occurred and the firebase thumbnail is deleted => ${JSON.stringify(albumImages)}`);
            }

            if (transaction) await transaction.rollback();
            logger.error(`Album Create Error ${JSON.stringify(error)}`);
            throw error;
        }
    }

    async updateAlbum(albumId: number, data: IUpdateWithAdmin, thumbnail?: File): Promise<Album> {
        const album: Album | null = await this.albumService.select(albumId);
        if (!album) throw new NotFoundError(`Not found album with using ${albumId}`);

        let updatedAlbum: Album | undefined = undefined;
        let transaction: Transaction | undefined = undefined;
        const prevThumbnail: string | null = album.thumbnail;

        try {
            transaction = await sequelize.transaction();

            updatedAlbum = await this.albumAdminService.update(transaction, album, data, thumbnail);
            await transaction.commit();

            if (prevThumbnail) await deleteFile(prevThumbnail);

            return updatedAlbum;
        } catch (error) {
            if (updatedAlbum?.thumbnail) await deleteFile(updatedAlbum?.thumbnail);
            if (transaction) await transaction.rollback();

            logger.error(`Update album error in admin api => ${JSON.stringify(error)}`);
            throw error;
        }
    }

    async deleteAlbums(albumIds: number[]): Promise<void> {
        const albums: Album[] = await this.albumAdminService.selectMutiple(albumIds);
        if (!albums.length || albums.length <= 0) throw new NotFoundError("Not found albums");
        let transaction: Transaction | undefined = undefined;

        try {
            const thumbnailPaths: string[] = [];
            const albumPaths: string[] = [];

            transaction = await sequelize.transaction();

            for (const album of albums) {
                await album.destroy({ transaction });

                if (album.thumbnail) thumbnailPaths.push(album.thumbnail);

                const albumPath = `${this.albumAdminService.getAlbumFolderPath(album.cupId, album.albumId)}`;
                albumPaths.push(albumPath);
            }

            await transaction.commit();

            const promises = [];

            promises.push(deleteFiles(thumbnailPaths));
            for (const albumPath of albumPaths) promises.push(deleteFolder(albumPath));

            await Promise.allSettled(promises);
        } catch (error) {
            logger.error(`Delete album error => ${JSON.stringify(error)}`);
            if (transaction) await transaction.rollback();

            throw error;
        }
    }

    async deleteAlbumImages(imageIds: number[]): Promise<void> {
        const images: AlbumImage[] = await this.albumImageService.select(imageIds);
        if (!images.length || images.length <= 0) throw new NotFoundError("Not found images");
        let transaction: Transaction | undefined = undefined;

        try {
            transaction = await sequelize.transaction();

            const paths = images.map((image: AlbumImage) => {
                return image.image;
            });

            await this.albumImageService.delete(transaction, imageIds);
            await transaction.commit();

            await deleteFiles(paths);
        } catch (error) {
            logger.error(`Delete album error => ${JSON.stringify(error)}`);
            if (transaction) await transaction.rollback();
            throw error;
        }
    }
}

export default AlbumAdminController;
