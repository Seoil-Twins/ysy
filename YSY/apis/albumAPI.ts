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
    const resData = await API.post('/album/merge/', data);
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
  patchRepImgAlbum: async (cup_id: string, album_id: number, data?: any) => {
    const resData = await API.patch_formdata(
      `/album/${cup_id}/${album_id}/thumbnail`,
      data,
    );
    return resData;
  },
  deleteAlbum: async (cup_id: string, album_id: number[] | number) => {
    if (Array.isArray(album_id)) {
      for (const target_id of album_id) {
        await API.delete(`/album/${cup_id}/${target_id}`);
      }
    } else {
      await API.delete(`/album/${cup_id}/${album_id}`);
    }
  },
  deleteImage: async (cup_id: string, album_id: number, data: number[]) => {
    const rData = await API.delete(`/album/${cup_id}/${album_id}/image`, {
      data,
    });
    return rData;
  },
};
