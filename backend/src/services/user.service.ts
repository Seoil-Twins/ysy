import dayjs from "dayjs";
import randomString from "randomstring";
import { FindAttributeOptions, IncludeOptions, InferAttributes, Op, Transaction, WhereOptions } from "sequelize";

import { UNKNOWN_NAME } from "../constants/file.constant.js";

import { API_ROOT } from "../index.js";

import { Service } from "./service.js";

import logger from "../logger/logger.js";
import { User } from "../models/user.model.js";
import { ResponseUser, CreateUser } from "../types/user.type.js";
import { Couple } from "../models/couple.model.js";

import NotFoundError from "../errors/notFound.error.js";

import { File, MimeType, uploadFileWithGCP } from "../utils/gcp.util.js";

class UserService extends Service {
  private readonly FOLDER_NAME: string = "users";
  readonly EXCLUDE_FOR_RESPONSE: FindAttributeOptions = {
    exclude: ["snsId", "deleted", "deleted_time"]
  };

  /**
   * 프로필 사진 경로를 생성합니다.
   *
   * @param userId 유저 ID
   * @param file 사진 객체
   * @returns string | null - 프로필 사진 경로 또는 없음
   */
  createPath(userId: number, file: File): string {
    const reqFileName = file.originalname;
    const path: string = `${this.FOLDER_NAME}/${userId}/profile/${dayjs().valueOf()}.${reqFileName}`;

    return path;
  }

  /**
   * 유저 코드를 생성합니다.
   *
   * @returns Promise\<string\> - 생성한 유저 코드
   */
  async createCode(): Promise<string> {
    let isNot = true;
    let code = "";

    while (isNot) {
      code = randomString.generate({
        length: 6,
        charset: "alphanumeric"
      });

      const user: User | null = await this.select({ code });
      if (!user) isNot = false;
    }

    return code;
  }

  getURL(): string {
    return `${API_ROOT}/user/me`;
  }

  /**
   * Where을 사용한 유저 가져옵니다.
   *
   * @param where {@link WhereOptions}
   * @returns Promise\<{@link User} | null\>
   */
  async select(where: WhereOptions<User>, include?: IncludeOptions): Promise<User | null> {
    const user: User | null = await User.findOne({ where, include });
    return user;
  }

  /**
   * ResponseUser에 맞는 User 객체 반환합니다.
   *
   * @param userId 유저 ID
   * @returns Promise\<{@link ResponseUser} | null\>
   */
  async selectForResponse(userId: number): Promise<ResponseUser | null> {
    const user1: User | null = await User.findOne({
      attributes: this.EXCLUDE_FOR_RESPONSE,
      where: { userId }
    });

    let user2: User | null = null;

    if (!user1) return null;

    if (user1.cupId !== null) {
      user2 = await User.findOne({
        attributes: this.EXCLUDE_FOR_RESPONSE,
        where: {
          cupId: user1.cupId,
          [Op.not]: {
            userId: user1.userId
          }
        }
      });
    }

    const result: ResponseUser = {
      ...user1.dataValues,
      couple: user2 ? user2 : undefined
    };

    return result;
  }

  /**
   * couple를 통해 User를 가져옵니다.
   *
   * @param couple {@link Couple}
   * @returns Promise\<{@link User User[]}\>
   */
  async selectWithCouple(couple: Couple): Promise<User[]> {
    const users: User[] = await couple.getUsers();
    return users;
  }

  /**
   * 사용자를 생성합니다.
   *
   * @param transaction 현재 사용 중인 트랜잭션
   * @param data {@link CreateUser}
   * @returns Promise\<{@link User}\>
   */
  async create(transaction: Transaction | null, data: CreateUser): Promise<User> {
    const code = await this.createCode();
    let createdUser: User = await User.create(
      {
        snsKind: data.snsKind,
        snsId: data.snsId,
        code: code,
        name: data.name,
        email: data.email,
        birthday: new Date(data.birthday),
        phone: data.phone,
        eventNofi: data.eventNofi
      },
      { transaction }
    );

    return createdUser;
  }

  /**
   * 사용자를 생성합니다.
   *
   * @param transaction 현재 사용 중인 트랜잭션
   * @param data {@link CreateUser}
   * @param profile {@link File}
   * @returns Promise\<{@link User}\>
   */
  async createWithProfile(transaction: Transaction | null, data: CreateUser, profile: File | string): Promise<User> {
    const code = await this.createCode();
    let createdUser: User = await User.create(
      {
        snsKind: data.snsKind,
        snsId: data.snsId,
        code: code,
        name: data.name,
        email: data.email,
        birthday: new Date(data.birthday),
        phone: data.phone,
        eventNofi: data.eventNofi
      },
      { transaction }
    );

    if (typeof profile === "string") {
      createdUser = await createdUser.update(
        {
          profile: profile,
          profileSize: 0,
          profileType: MimeType.URL
        },
        { transaction }
      );
    } else {
      const path = this.createPath(createdUser.userId, profile);

      createdUser = await createdUser.update(
        {
          profile: path,
          profileSize: profile.size,
          profileType: profile.mimetype ? profile.mimetype : UNKNOWN_NAME
        },
        { transaction }
      );

      await uploadFileWithGCP({
        filename: path,
        buffer: profile.buffer,
        mimetype: profile.mimetype,
        size: profile.size
      });
    }

    return createdUser;
  }

  /**
   * 유저 기본 정보를 수정합니다.
   *
   * ### Example
   * ```typescript
   * // 유저 정보를 수정합니다.
   * const updatedUser: User = update(transaction, user, data);
   *
   * // 유저 정보를 수정하고 기존 profile을 삭제합니다.
   * const updatedUser: User = update(transaction, user, { ...data, profile: null }});
   * ```
   *
   * @param transaction 현재 사용 중인 트랜잭션
   * @param user {@link User}
   * @param data {@link User}
   * @returns Promise\<{@link User}\>
   */
  async update(transaction: Transaction | null, user: User, data: Partial<InferAttributes<User>>): Promise<User> {
    const updatedUser: User = await user.update(data, { transaction });
    return updatedUser;
  }

  /**
   * 유저 기본 정보 업데이트 및 profile 정보를 수정합니다.
   *
   * @param transaction 현재 사용 중인 트랜잭션
   * @param user {@link User}
   * @param data {@link User}
   * @param profile {@link Express.Multer.File}
   * @returns Promise\<{@link User}\>
   */
  async updateWithProfile(transaction: Transaction | null, user: User, data: Partial<InferAttributes<User>>, profile: File): Promise<User> {
    const path = this.createPath(user.userId, profile);
    const updatedUser = await user.update(
      {
        ...data,
        profile: path,
        profileSize: profile.size,
        profileType: profile.mimetype ? profile.mimetype : UNKNOWN_NAME
      },
      { transaction }
    );

    await uploadFileWithGCP({
      filename: path,
      buffer: profile.buffer,
      mimetype: profile.mimetype,
      size: profile.size
    });

    return updatedUser;
  }

  async updateWithData(transaction: Transaction | null, user: User, data: Partial<InferAttributes<User>>): Promise<User> {
    const updatedUser: User = await user.update(data, { transaction });
    return updatedUser;
  }

  /**
   * 사용자 정보를 삭제합니다. (soft delete)
   *
   * @param transaction 현재 사용 중인 트랜잭션
   * @param user {@link User}
   */
  async delete(transaction: Transaction | null, user: User): Promise<void> {
    await user.update(
      {
        deleted: true,
        deletedTime: new Date(dayjs().valueOf())
      },
      { transaction }
    );

    logger.debug(`Success Deleted userId => ${user.userId}`);
  }
}

export default UserService;
