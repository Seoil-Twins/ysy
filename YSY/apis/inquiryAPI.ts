import { API } from '../util/API';

export const inquiryAPI = {
  getInquiry: async (data?: any) => {
    const res = await API.get('/inquiry', data);
    return res;
  },
};
