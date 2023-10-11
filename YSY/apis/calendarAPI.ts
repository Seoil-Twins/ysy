import { API } from '../util/API';

export const albumAPI = {
  getSchedule: async (cup_id: string, year: string) => {
    const data = await API.get(`/calendar/${cup_id}/${year}`);
    return data;
  },
};
