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
  getCouple: async (cup_id: string) => {
    const res = await API.get(`/couple/${cup_id}`);
    return res;
  },
  patchCouple: async (cup_id: string, data?: any) => {
    const res = await API.patch(`/couple/${cup_id}`, data);
    console.log('cd:: ' + data);
    console.log(data);
    return res;
  },
  patchFormdataCouple: async (cup_id: string, data?: any) => {
    const res = await API.patch_formdata(`/couple/${cup_id}`, data);
    return res;
  },
};
