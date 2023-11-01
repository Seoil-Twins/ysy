// import { useQuery } from 'react-query';
import { API } from '../util/API';
import { LoginOptions } from '../util/login';

// function UseCallApiQuery(queryName: string, ResData: any) {
//   const { data, error, isLoading } = useQuery(queryName, ResData);

//   if (!isLoading) {
//     if (error) {
//       console.error('앙' + error);
//     } else {
//       console.log(data);
//     }
//   }

//   return data;
// }

export const userAPI = {
  getUserMe: async () => {
    try {
      const data = await API.get('/user/me');
      console.log(data);
      return data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  postSignUp: async (loginData: LoginOptions) => {
    try {
      if (loginData.profile) {
        const data = await API.post_formdata('/user', loginData);
        return data;
      } else {
        const data = await API.post('/user', loginData);
        return data;
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  patchUser: async (
    user_id: number,
    data?: {
      name: string;
      birthday: string;
      phone: string;
      email: string;
    },
  ) => {
    try {
      const res = await API.patch(`/user/${user_id}`, data);
      console.log(res);
      return res;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  patchUserNofi: async (
    user_id: number,
    data?: { key: string; value: boolean },
  ) => {
    try {
      const res = await API.patch(`/user/nofi/${user_id}`, data);
      return res;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  patchUserProfile: async (
    user_id: number,
    fileParamName: string,
    data?: any,
  ) => {
    const res = await API.patch_formdata(
      `/user/${user_id}`,
      data,
      fileParamName,
    );
    return res;
  },
  deleteUser: async (user_id: number) => {
    const res = await API.delete(`/user/${user_id}`);
    return res;
  },
};
