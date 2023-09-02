import dayjs from "dayjs";
import formidable, { File } from "formidable";
import randomString from "randomstring";
import { Op, Transaction, WhereOptions } from "sequelize";

import { API_ROOT } from "..";

import { Service } from "./service";

import logger from "../logger/logger";
import { User } from "../models/user.model";
import { ResponseUser, CreateUser, UpdateUser } from "../types/user.type";
import { Couple } from "../models/couple.model";

import ConflictError from "../errors/conflict.error";

import { uploadFile } from "../utils/firebase.util";

import NotFoundError from "../errors/notFound.error";
import ForbiddenError from "../errors/forbidden.error";

class UserService extends Service {
  private FOLDER_NAME = "users";

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
   * 유저 가져오기
   * @param where {@link WhereOptions}
   * @returns Promise\<{@link User} | null\>
   */
  async select(where: WhereOptions): Promise<User | null> {
    const user: User | null = await User.findOne({ where });
    return user;
  }

  /**
   * ResponseUser에 맞는 User 객체 반환
   * @param userId 유저 ID
   * @returns Promise\<{@link ResponseUser} | null\>
   */
  async selectForResponse(userId: number): Promise<ResponseUser | null> {
    const exclude = ["snsId", "deleted", "deleted_time"];
    const user1: User | null = await User.findOne({
      attributes: { exclude },
      where: { userId }
    });

    let user2: User | null = null;

    if (!user1) return null;

    if (user1.cupId !== null) {
      user2 = await User.findOne({
        attributes: { exclude },
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
  async create(transaction: Transaction | null = null, data: CreateUser, profile?: File): Promise<User> {
    const user: User | null = await this.select({ email: data.email, phone: data.phone });
    if (user) throw new ConflictError("Duplicated User");

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
          profile: path
        },
        { transaction }
      );
      await uploadFile(path, profile.filepath);
    }

    return createdUser;
  }

  /**
   * 유저 기본 정보 업데이트
   * @param transaction 현재 사용 중인 트랜잭션
   * @param user {@link User}
   * @param data {@link UpdateUser}
   * @param file {@link formidable.File}
   * @returns Promise\<{@link User}\>
   */
  async update(transaction: Transaction | null = null, user: User, data: UpdateUser): Promise<User> {
    const updatedUser: User = await user.update(data, { transaction });

    return updatedUser;
  }

  /**
   * 유저 기본 정보 업데이트 및 profile 수정
   *
   * ### Example
   * ```typescript
   * // 기존 profile을 삭제하고 새로운 profile을 업로드합니다.
   * const updatedUser: User = updateWithProfile(transaction, user, data, profile);
   *
   * // 기존 profile을 삭제합니다.
   * const updatedUser: User = updateWithProfile(transaction, user, data, null);
   * ```
   *
   * @param transaction 현재 사용 중인 트랜잭션
   * @param user {@link User}
   * @param data {@link UpdateUser}
   * @param file {@link formidable.File}
   * @returns Promise\<{@link User}\>
   */
  async updateWithProfile(transaction: Transaction | null = null, user: User, data: UpdateUser, profile: File | null): Promise<User> {
    let path: string | null = null;
    let updatedUser: User | null = null;

    if (profile) {
      path = this.createProfile(user.userId, profile);

      updatedUser = await user.update(
        {
          ...data,
          profile: path
        },
        { transaction }
      );
    } else {
      updatedUser = await user.update(
        {
          ...data,
          profile: null
        },
        { transaction }
      );
    }

    if (profile && path) await uploadFile(path, profile.filepath);
    return updatedUser;
  }

  /**
   * 사용자 삭제
   * @param transaction 현재 사용 중인 트랜잭션
   * @param user {@link User}
   */
  async delete(transaction: Transaction | null = null, user: User): Promise<void> {
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
