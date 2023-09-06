import dayjs from "dayjs";
import formidable, { File } from "formidable";
import randomString from "randomstring";
import { FindAttributeOptions, InferAttributes, Op, Transaction, WhereOptions } from "sequelize";

import { UNKNOWN_NAME } from "../constants/file.constant";

import { API_ROOT } from "..";

import { Service } from "./service";

import logger from "../logger/logger";
import { User } from "../models/user.model";
import { ResponseUser, CreateUser } from "../types/user.type";
import { Couple } from "../models/couple.model";

import NotFoundError from "../errors/notFound.error";

import { uploadFile } from "../utils/firebase.util";

class UserService extends Service {
  private readonly FOLDER_NAME: string = "users";
  readonly EXCLUDE_FOR_RESPONSE: FindAttributeOptions = {
    exclude: ["snsId", "deleted", "deleted_time"]
  };

  /**
   * 프로필 사진 경로 생성
   * @param userId 유저 ID
   * @param file 사진 객체
   * @returns string | null - 프로필 사진 경로 또는 없음
   */
  createProfile(userId: number, file: File): string {
    const reqFileName = file.originalFilename!;
    const path: string = `${this.FOLDER_NAME}/${userId}/profile/${dayjs().valueOf()}_${reqFileName}`;

    return path;
  }

  /**
   * 유저 코드 생성
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
   * Where을 사용한 유저 가져오기
   * @param where {@link WhereOptions}
   * @returns Promise\<{@link User} | null\>
   */
  async select(where: WhereOptions<User>): Promise<User | null> {
    const user: User | null = await User.findOne({ where });
    return user;
  }

  /**
   * ResponseUser에 맞는 User 객체 반환
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
   * couple를 통해 User 가져오기
   * @param couple {@link Couple}
   * @returns Promise\<{@link User User[]}\>
   */
  async selectWithCouple(couple: Couple): Promise<User[]> {
    const users: User[] = await couple.getUsers();
    return users;
  }

  /**
   * 사용자 생성
   * @param transaction 현재 사용 중인 트랜잭션
   * @param data {@link CreateUser}
   * @returns Promise\<{@link User}\>
   */
  async create(transaction: Transaction | null, data: CreateUser, profile?: File): Promise<User> {
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

    if (profile) {
      const path = this.createProfile(createdUser.userId, profile);

      createdUser = await createdUser.update(
        {
          profile: path,
          profileSize: profile.size,
          profileType: profile.mimetype ? profile.mimetype : UNKNOWN_NAME
        },
        { transaction }
      );

      await uploadFile(path, profile.filepath);
    }

    return createdUser;
  }

  /**
   * 유저 기본 정보 수정
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
   * 유저 기본 정보 업데이트 및 profile 수정
   *
   * @param transaction 현재 사용 중인 트랜잭션
   * @param user {@link User}
   * @param data {@link User}
   * @param profile {@link formidable.File}
   * @returns Promise\<{@link User}\>
   */
  async updateWithProfile(transaction: Transaction | null, user: User, data: Partial<InferAttributes<User>>, profile: File): Promise<User> {
    const path = this.createProfile(user.userId, profile);
    const updatedUser = await user.update(
      {
        ...data,
        profile: path,
        profileSize: profile.size,
        profileType: profile.mimetype ? profile.mimetype : UNKNOWN_NAME
      },
      { transaction }
    );

    await uploadFile(path, profile.filepath);
    return updatedUser;
  }

  async updateWithData(transaction: Transaction | null, user: User, data: Partial<InferAttributes<User>>): Promise<User> {
    const updatedUser: User = await user.update(data, { transaction });
    return updatedUser;
  }

  /**
   * 사용자 삭제
   * @param transaction 현재 사용 중인 트랜잭션
   * @param user {@link User}
   */
  async delete(transaction: Transaction | null, user: User): Promise<void> {
    if (!user) throw new NotFoundError("Not Found User");

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
