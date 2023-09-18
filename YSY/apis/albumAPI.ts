// import { useQuery } from 'react-query';
import { API } from '../util/API';

export const albumAPI = {
  getAlbumFolder: async (cup_id: string) => {
    try {
      // const data = await UseCallApiQuery('userme', API.get('/user/me')); // error 발생
      const data = await API.get(`/album/${cup_id}`);
      //   console.log('aasdasdas' + JSON.stringify(data));
      return data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  postNewAlbum: async (cup_id: string, postData: string[]) => {
    try {
      // const data = await UseCallApiQuery('userme', API.get('/user/me')); // error 발생
      const data = await API.post(`/album/${cup_id}`, postData);
      return data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
};
