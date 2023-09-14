import { useQuery } from 'react-query';
import { API } from '../util/API';

function CallApiQuery(queryName: string, ResData: any) {
  const { data, error, isLoading } = useQuery('userme', ResData);

  if (!isLoading) {
    if (error) {
      console.error(error);
    } else {
      console.log(data);
    }
  }

  return data;
}

export const userAPI = {
  getUserMe: async () => {
    try {
      const data = CallApiQuery('userme', API.get('/user/me')); // error 발생
      console.log('카무이');
      console.log('카무이' + data);
    } catch (error) {
      console.log(error);
      return error;
    }
  },
};
