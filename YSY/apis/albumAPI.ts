// import { useQuery } from 'react-query';
import { API } from '../util/API';

export const albumAPI = {
  getAlbumFolder: async (cup_id: string, sort?: string) => {
    const sortData = { sort: sort };
    const data = await API.get(`/album/${cup_id}`, sortData);
    //   console.log('aasdasdas' + JSON.stringify(data));
    return data;
  },
  postNewAlbum: async (cup_id: string, postData: string[]) => {
    // const data = await UseCallApiQuery('userme', API.get('/user/me')); // error 발생
    const data = await API.post(`/album/${cup_id}`, postData);
    return data;
  },
};
