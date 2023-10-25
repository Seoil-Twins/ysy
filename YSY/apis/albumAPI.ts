// import { useQuery } from 'react-query';
import { API } from '../util/API';

export const albumAPI = {
  getAlbumFolder: async (cup_id: string, sort?: string) => {
    const sortData = { sort: sort };
    const data = await API.get(`/album/${cup_id}`, sortData);
    return data;
  },
  getAlbumImages: async (cup_id: string, album_id: number, data?: string[]) => {
    const resData = await API.get(`/album/${cup_id}/${album_id}`, data);
    return resData;
  },
  postNewAlbum: async (cup_id: string, postData: any) => {
    const data = await API.post(`/album/${cup_id}`, postData);
    return data;
  },
  postNewImage: async (cup_id: string, album_id: number, data: any) => {
    const res = await API.post_formdata(`/album/${cup_id}/${album_id}`, data);
    return res;
  },
  postMergeAlbum: async (cup_id: string, data?: any) => {
    console.log(data);
    const resData = await API.post('/album/merge/', data);
    //   console.log('aasdasdas' + JSON.stringify(data));
    return resData;
  },
  patchTitleAlbum: async (
    cup_id: string,
    album_id: number,
    data?: string[],
  ) => {
    const resData = await API.patch(`/album/${cup_id}/${album_id}/title`, data);
    return resData;
  },
  patchRepImgAlbum: async (
    cup_id: string,
    album_id: number,
    data?: FormData,
  ) => {
    const resData = await API.patch_formdata(
      `/album/${cup_id}/${album_id}/thumbnail`,
      data,
    );
    console.log(resData);
    return resData;
  },
  deleteAlbum: async (cup_id: string, album_id: number[]) => {
    for (const target_id of album_id) {
      const resData = await API.delete(`/album/${cup_id}/${target_id}`);
      console.log(resData);
    }
  },
  deleteImage: async (cup_id: string, album_id: number, data: string[]) => {
    console.log(data);
    console.log(cup_id, album_id, data);
    const rData = await API.delete(`/album/${cup_id}/${album_id}/image`, {
      data,
    });
    return rData;
  },
};
