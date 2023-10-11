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
      return error;
    }
  },
  postSignUp: async (loginData: LoginOptions) => {
    try {
      // if (loginData.profile) {
      //   console.log('1');
      //   const data = await API.post_formdata('/user', loginData);
      //   return data;
      // } else {
      console.log('2');
      const data = await API.post('/user', loginData);
      return data;
      // }
    } catch (error) {
      console.log(error);
      return error;
    }
  },
};
