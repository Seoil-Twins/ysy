import dayjs from "dayjs";
import { FindOptions, InferAttributes, OrderItem, Transaction, WhereOptions } from "sequelize";

import { UNKNOWN_NAME } from "../constants/file.constant";

import { API_ROOT } from "..";

import sequelize from "../models";
import { AlbumImage } from "../models/albumImage.model";
import { Album } from "../models/album.model";
import { Couple } from "../models/couple.model";
import { PageOptions } from "../types/album.type";

import { uploadFileWithGCP } from "../utils/gcp.util";
import { createSortOptions } from "../utils/sort.util";

import { Service } from "./service";

class AlbumService extends Service {
  private FOLDER_NAME = "couples";

  getURL(): string {
    throw new Error("Method not implemented.");
  }

  getFolderUrl(cupId: string): string {
    return `${API_ROOT}/album/${cupId}`;
  }

  getAlbumUrl(cupId: string, albumId: number): string {
    return `${API_ROOT}/album/${cupId}/${albumId}`;
  }

  /**
   * 앨범 가져오기
   * @param albumId 앨범이 가지는 고유한 아이디
   * @param isInclude 앨범 이미지 조인 여부
   * @returns Promise\<{@link Album} | null\>
   */
  async select(albumId: number, isInclude: boolean = false): Promise<Album | null> {
    let options: FindOptions = {};

    if (isInclude) {
      options = {
        include: {
          model: AlbumImage,
          as: "albumImages"
        }
      };
    }

    const album: Album | null = await Album.findByPk(albumId, options);
    return album;
  }

  async selectAll(where: WhereOptions<Album>): Promise<Album[]> {
    const albums: Album[] = await Album.findAll({ where });
    return albums;
  }

  /**
   * 폴더 가져오기를 위한 검색 메소드
   * @param cupId 커플이 가지는 고유한 아이디
   * @param pageOptions {@link PageOptions}
   * @returns Promise\<{ albums: {@link Album}[], total: number \}>
   */
  async selectAllForFolder(cupId: string, pageOptions: PageOptions): Promise<{ albums: Album[]; total: number }> {
    const sortOptions: OrderItem = createSortOptions(pageOptions.sort);
    const offset: number = (pageOptions.page - 1) * pageOptions.count;

    const total = await Album.count({ where: { cupId } });
    const albums: Album[] = await Album.findAll({
      where: { cupId },
      order: [sortOptions],
      offset,
      limit: pageOptions.count,
      attributes: {
        include: [[sequelize.fn("COUNT", sequelize.col("albumImages.album_id")), "total"]]
      },
      include: {
        model: AlbumImage,
        as: "albumImages",
        duplicating: false,
        attributes: []
      },
      group: "Album.album_id"
    });
    return { albums, total };
  }

  /**
   * Couple 객체에 해당 하는 앨범들 가져오기
   * @param couple {@link Couple}
   * @returns Promise\<{@link Album}[]\>
   */
  async selectWithCouple(couple: Couple): Promise<Album[]> {
    const albums: Album[] = await couple.getAlbums();
    return albums;
  }

  /**
   * 앨범 폴더 생성
   * @param transaction 현재 사용중인 트랜잭션
   * @param cupId 커플이 가지는 고유한 아이디
   * @param title 앨범 제목
   * @returns Promise\<{@link Album}\>
   */
  async create(transaction: Transaction | null, cupId: string, title: string): Promise<Album> {
    const album: Album = await Album.create({ cupId, title }, { transaction });
    return album;
  }

  /**
   * 앨범 정보 수정
   * @param transaction 현재 사용중인 트랜잭션
   * @param album {@link Album}
   * @param data {@link Album}
   * @returns Promise\<{@link Album}\>
   */
  async update(transaction: Transaction | null, album: Album, data: Partial<InferAttributes<Album>>): Promise<Album> {
    const updatedAlbum = await album.update(data, { transaction });
    return updatedAlbum;
  }

  /**
   * 앨범 대표 사진 수정
   * @param transaction 현재 사용중인 트랜잭션
   * @param album {@link Album}
   * @param thumbnail {@link formidable.File}
   * @returns Promise\<{@link Album}\>
   */
  async updateWithThumbnail(transaction: Transaction | null, album: Album, thumbnail: Express.Multer.File): Promise<Album> {
    const path = `${this.FOLDER_NAME}/${album.cupId}/${album.albumId}/thumbnail/${dayjs().valueOf()}.${thumbnail.originalname}`;

    const updatedAlbum: Album = await album.update(
      {
        thumbnail: path,
        thumbnailSize: thumbnail.size,
        thumbnailType: thumbnail.mimetype ? thumbnail.mimetype : UNKNOWN_NAME
      },
      { transaction }
    );

    await uploadFileWithGCP({
      filename: path,
      buffer: thumbnail.buffer,
      mimetype: thumbnail.mimetype
    });

    return updatedAlbum;
  }

  /**
   * 앨범 삭제
   * @param transaction 현재 사용중인 트랜잭션
   * @param album {@link Album}
   */
  async delete(transaction: Transaction | null, album: Album): Promise<void> {
    await album.destroy({ transaction });
  }

  /**
   * 앨범 삭제
   * @param transaction 현재 사용중인 트랜잭션
   * @param albums {@link Album}[]
   */
  async deletes(transaction: Transaction | null, albums: Album[]): Promise<void> {
    for (const album of albums) {
      await album.destroy({ transaction });
    }
  }
}

export default AlbumService;
