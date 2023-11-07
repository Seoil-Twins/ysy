import { API } from '../util/API';

export const noticeAPI = {
  getNotice: async (data?: any) => {
    const res = await API.get('/notice', data);
    return res;
  },
};
