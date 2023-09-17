// import { useQuery } from 'react-query';
import { API } from '../util/API';

export const albumAPI = {
  getAlbumFolder: async (cup_id: string) => {
    try {
      // const data = await UseCallApiQuery('userme', API.get('/user/me')); // error 발생
      const data = await API.get(`/album/${cup_id}`); // error 발생
      //   console.log('aasdasdas' + JSON.stringify(data));
      return data;
    } catch (error) {
      console.log(error);
      return error;
    }
  },
};
