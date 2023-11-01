import { API } from '../util/API';

export const inquiryAPI = {
  getInquiry: async (data?: any) => {
    const res = await API.get('/inquiry', data);
    console.log(res);
    return res;
  },
  postInquiry: async (data?: any) => {
    const res = await API.post('/inquiry', data);
    return res;
  },
  postFormInquiry: async (data?: any) => {
    const res = await API.post_formdata('/inquiry', data, 'images');
    return res;
  },
};
