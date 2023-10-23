import { API } from '../util/API';

export const calendarAPI = {
  getSchedule: async (cup_id: string, year: number) => {
    const data = await API.get(`/calendar/${cup_id}/${year}`);
    return data;
  },
  postSchedule: async (cup_id: string, data?: any) => {
    const response = await API.post(`/calendar/${cup_id}`, data);
    return response;
  },
  deleteSchedule: async (cup_id: string, calendar_id: string) => {
    const response = await API.delete(`/calendar/${cup_id}/${calendar_id}`);
    return response;
  },
};
