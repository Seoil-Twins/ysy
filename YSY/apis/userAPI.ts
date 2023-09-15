// import { useQuery } from 'react-query';
import { API } from '../util/API';

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
      // const data = await UseCallApiQuery('userme', API.get('/user/me')); // error 발생
      const data = await API.get('/user/me'); // error 발생
      // console.log('aasdasdas' + JSON.stringify(data));
      return data;
    } catch (error) {
      console.log(error);
      return error;
    }
  },
};
