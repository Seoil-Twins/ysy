import dayjs from "dayjs";
import formidable, { File } from "formidable";
import { FindAttributeOptions, InferAttributes, Transaction } from "sequelize";

import { API_ROOT } from "..";

import { Couple } from "../models/couple.model";
import { CreateCouple, UpdateCouple } from "../types/couple.type";
import { User } from "../models/user.model";

import { Service } from "./service";

import { uploadFile } from "../utils/firebase.util";

class CoupleService extends Service {
  private readonly FOLDER_NAME = "couples";

  /**
   * 썸네일 사진 경로 생성합니다.
   * @param userId 유저 ID
   * @param file 사진 객체
   * @returns string
   */
  createProfile(cupId: string, thumbnail: File): string {
    const reqFileName = thumbnail.originalFilename!;
    const path: string = `${this.FOLDER_NAME}/${cupId}/thumbnail/${dayjs().valueOf()}_${reqFileName}`;

    return path;
  }

  getURL(cupId: string): string {
    return `${API_ROOT}/couple/${cupId}`;
  }

  /**
   * cupId를 통해 검색합니다.
   * @param cupId 커플이 가지는 고유한 아이디
   * @returns Promise\<{@link Couple} | null\>
   */
  async select(cupId: string): Promise<Couple | null> {
    const couple: Couple | null = await Couple.findByPk(cupId);
    return couple;
  }

  /**
   * 커플 정보와 유저 정보를 검색합니다. (Join)
   *
   * ### Example
   * ```typescript
   * // couple 및 user 정보를 가져옵니다.
   * const couple: Couple | null = await coupleService.selectWithUsers(cupId);
   *
   * // couple 및 user 정보를 가져오지만 snsId, deleted, deletedTime은 제외합니다.
   * const attributes: FindAttributeOptions = { exclude: ["snsId", "deleted", "deletedTime"] };
   * const couple: Couple | null = await coupleService.selectWithUsers(cupId);
   * ```
   *
   * @param cupId 커플이 가지는 고유한 아이디
   * @param attributes {@link FindAttributeOptions}
   * @returns Promise\<{@link Couple} | null\>
   */
  async selectWithUsers(cupId: string, attributes?: FindAttributeOptions): Promise<Couple | null> {
    const couple: Couple | null = await Couple.findOne({
      where: { cupId: cupId },
      include: {
        model: User,
        as: "users",
        attributes
      }
    });

    return couple;
  }

  /**
   * 커플 정보를 수정합니다.
   * @param transaction 현재 사용중인 트랜잭션
   * @param cupId 커플이 가지는 고유한 ID
   * @param data {@link CreateCouple}
   * @param thumbnail {@link formidable.File}
   * @returns Promise\<{@link Couple}\>
   */
  async create(transaction: Transaction | null, cupId: string, data: CreateCouple, thumbnail?: File): Promise<Couple> {
    const path: string | null = thumbnail ? this.createProfile(cupId, thumbnail) : null;
    const createdCouple = await Couple.create(
      {
        cupId: cupId,
        cupDay: data.cupDay,
        thumbnail: path
      },
      { transaction }
    );

    if (thumbnail && path) await uploadFile(path, thumbnail.filepath);
    return createdCouple;
  }

  /**
   * 유저 정보를 수정합니다.
   *
   * ### Example
   * ```typescript
   * // 커플 정보를 수정합니다.
   * const updatedCouple: Couple = update(transaction, user, data);
   *
   * // 커플 정보를 수정하고 기존 thumbnail을 삭제합니다.
   * const updatedCouple: Couple = update(transaction, user, { ...data, thumbnail: null }});
   * ```
   *
   * @param transaction 현재 사용중인 트랜잭션
   * @param couple {@link Couple}
   * @param data {@link Couple}
   * @returns Promise\<{@link Couple}\>
   */
  async update(transaction: Transaction | null, couple: Couple, data: Partial<InferAttributes<Couple>>): Promise<Couple> {
    await couple.update(data, { transaction });
    return couple;
  }

  /**
   * 커플 정보 수정 및 썸네일을 수정 합니다.
   * @param transaction 현재 사용중인 트랜잭션
   * @param couple {@link Couple}
   * @param data {@link Couple}
   * @param thumbnail {@link formidable.File}
   * @returns Promise\<{@link Couple}\>
   */
  async updateWithThumbnail(transaction: Transaction | null, couple: Couple, data: UpdateCouple, thumbnail: File): Promise<Couple> {
    const firebasePath = this.createProfile(couple.cupId, thumbnail);

    await couple.update(
      {
        ...data,
        thumbnail: firebasePath,
        thumbnailSize: thumbnail.size,
        thumbnailType: thumbnail.mimetype ? thumbnail.mimetype : "unknown"
      },
      { transaction }
    );

    await uploadFile(firebasePath, thumbnail.filepath);
    return couple;
  }

  /**
   * 커플을 삭제합니다.
   * @param transaction 현재 사용중인 트랜잭션
   * @param couple {@link Couple}
   */
  async delete(transaction: Transaction | null, couple: Couple): Promise<void> {
    const currentTime = new Date(dayjs().valueOf());

    await couple.update(
      {
        deleted: true,
        deletedTime: currentTime
      },
      { transaction }
    );
  }
}

export default CoupleService;
