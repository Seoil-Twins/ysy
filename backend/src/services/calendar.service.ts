import { InferAttributes, Op, Transaction } from "sequelize";

import { API_ROOT } from "..";

import { Calendar } from "../models/calendar.model";
import { Couple } from "../models/couple.model";

import { CreateCalendar, UpdateCalendar } from "../types/calendar.type";

import { Service } from "./service";
import sequelize from "../models";

class CalendarService extends Service {
  getURL(cupId: string, year: number): string {
    return `${API_ROOT}/calendar/${cupId}/${year}`;
  }

  /**
   * 캘린더 아이디로 캘린더를 검색하고 결과를 반환합니다.
   *
   * @param calendarId 캘린더 고유한 아이디
   * @returns Promise\<{@link Calendar} | null\>
   */
  async select(calendarId: number): Promise<Calendar | null> {
    const calendar: Calendar | null = await Calendar.findOne({
      where: { calendarId }
    });

    return calendar;
  }

  /**
   * 커플 아이디, 일정 시작 시간, 일정 끝 시간을 사용하여
   * 해당하는 모든 일정을 검색 및 반환합니다.
   *
   * ### Example
   * ```typescript
   * // 2022-01-01 00:00:00시부터 2022-01-08 07:00:00 사이의 일정을 가져옵니다.
   * // 즉, 시간도 포함합니다.
   * const response: Calendar[] = await this.calendarService.selectAll(cupId, '2022-01-01 00:00:00', '2022-01-08 07:00:00');
   * ```
   *
   * @param cupId 커플의 고유한 아이디
   * @param startDate 시작 시간 (YYYY:MM:DD HH:mm:ss)
   * @param endDate 끝 시간 (YYYY:MM:DD HH:mm:ss)
   * @returns Promise\<{@link Calendar Calendar[]}\>
   */
  async selectAll(cupId: string, startDate: string, endDate: string): Promise<Calendar[]> {
    console.log(startDate, endDate);

    const calendars: Calendar[] = await Calendar.findAll({
      attributes: { exclude: ["cupId"] },
      where: {
        cupId,
        [Op.or]: {
          fromDate: {
            [Op.and]: [
              {
                [Op.gte]: startDate
              },
              {
                [Op.lte]: endDate
              }
            ]
          },
          toDate: {
            [Op.and]: [
              {
                [Op.gte]: startDate
              },
              {
                [Op.lte]: endDate
              }
            ]
          }
        }
      },
      order: [[sequelize.literal("toDate - fromDate"), "DESC"]]
    });

    return calendars;
  }

  /**
   * 커플 객체를 사용하여 해당하는 모든 캘린더를 가져옵니다.
   *
   * @param couple {@link Couple} - 커플 객체
   * @returns Promise\<{@link Calendar Calendar[]}\>
   */
  async selectWithCouple(couple: Couple): Promise<Calendar[]> {
    const calendars: Calendar[] = await couple.getCalendars();
    return calendars;
  }

  /**
   * 일정을 추가합니다.
   *
   * @param transaction 현재 사용중인 트랜잭션
   * @param cupId 커플이 가지는 고유한 아이디
   * @param data {@link CreateCalendar}
   * @returns Promise\<{@link Calendar}\>
   */
  async create(transaction: Transaction | null = null, cupId: string, data: CreateCalendar): Promise<Calendar> {
    const createdCalendar: Calendar = await Calendar.create(
      {
        cupId,
        ...data
      },
      { transaction }
    );
    return createdCalendar;
  }

  /**
   * 일정을 수정합니다.
   *
   * @param transaction 현재 사용중인 트랜잭션
   * @param calendar {@link Calendar} - 캘린더 객체
   * @param data {@link UpdateCalendar}
   * @returns Promise\<{@link Calendar}\>
   */
  async update(transaction: Transaction | null = null, calendar: Calendar, data: UpdateCalendar): Promise<Calendar> {
    const updatedCalendar: Calendar = await calendar.update(data, { transaction });
    return updatedCalendar;
  }

  /**
   * 일정을 삭제합니다.
   *
   * @param transaction 현재 사용중인 트랜잭션
   * @param calendar {@link Calendar} - 캘린더 객체
   */
  async delete(transaction: Transaction | null = null, calendar: Calendar): Promise<any> {
    await calendar.destroy({ transaction });
  }

  /**
   * @deprecated admin에서 사용 중인 메소드입니다. 사라질 수 있습니다.
   *
   * 해당하는 모든 일정을 삭제합니다.
   *
   * @param transaction 현재 사용중인 트랜잭션
   * @param calendarIds 캘린더가 가지는 고유한 아이디 리스트
   */
  async deleteAll(transaction: Transaction | null = null, calendarIds: number[]): Promise<any> {
    await Calendar.destroy({ where: { calendarId: calendarIds }, transaction });
  }
}

export default CalendarService;
