import { API } from '../util/API';

export const dateAPI = {
  getDate: async (data?: any) => {
    const res = await API.get('/date-place', data);
    return res;
  },
  getDateOne: async (content_id: number, data?: any) => {
    const res = await API.get(`/date-place/${content_id}`, data);
    return res;
  },
  getDateSearch: async (data?: any) => {
    const res = await API.get('/date-place/search', data);
    return res;
  },
  getRegionCode: async () => {
    const res = await API.get('/region-code');
    return res;
  },
};
