import { API } from '../util/API';

export const favoriteAPI = {
  getFavorite: async () => {
    const res = await API.get('/date-place', { isFavorite: true });
    console.log(res);
    return res;
  },
};
