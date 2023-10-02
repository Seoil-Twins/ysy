import { API } from '../util/API';

export const albumAPI = {
  getAlbumFolder: async (cup_id: string, sort?: string) => {
    const sortData = { sort: sort };
    const data = await API.get(`/album/${cup_id}`, sortData);
    return data;
  },
};
