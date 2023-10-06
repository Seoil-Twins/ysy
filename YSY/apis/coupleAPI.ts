import { API } from '../util/API';

export const coupleAPI = {
  postNewCouple: async (data: {
    otherCode: string;
    cupDay: string;
    thumbnail: string;
  }) => {
    const res = await API.post('/couple/', data);
    return res;
  },
};
