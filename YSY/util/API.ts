import axios, { AxiosRequestConfig } from 'axios';
import { getStringData } from './asyncStorage';

const API_BASE_URL = 'http://10.0.2.2:3000';
// const FormData = require('form-data');

// const headers = {
//   'Content-Type': 'application/json', // 예시: JSON 형식의 데이터를 보낼 때

//   Authorization:
//     // 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImN1cElkIjpudWxsLCJyb2xlSWQiOjQsImlhdCI6MTY5NDUwMzM5MywiZXhwIjoxNjk3MDk1MzkzLCJpc3MiOiJ5c3l1c2VyIn0.6YEGd9PMlB43CHTjvOsRWVc11gr0ryiIzuEpMGJZNhk', // notebook
//     // 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImN1cElkIjpudWxsLCJyb2xlSWQiOjQsImlhdCI6MTY5NDk2OTc2NSwiZXhwIjoxNjk3NTYxNzY1LCJpc3MiOiJ5c3l1c2VyIn0._Op578kn8MNoJLQjH4o0e7U0YuHeCkJGEpgwE-Mmic0', // Desktop
//     //'Bearer ' + getStringData('accessToken'),
//     // 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjI1LCJjdXBJZCI6bnVsbCwicm9sZSI6MSwiaWF0IjoxNjgyOTI1MzUzLCJleHAiOjE2ODU1MTczNTMsImlzcyI6InlzeXVzZXIifQ.QwbRdP-l9ZGdx2lPWSPWDkKDEuP0CbxP1seHkYgOLVs',
// };

export interface File {
  uri: string;
  type: string;
  size: number;
  name: string;
}

const getToken = async () => {
  return await getStringData('accessToken');
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json', // 예시: JSON 형식의 데이터를 보낼 때

    // Authorization:
    // 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImN1cElkIjpudWxsLCJyb2xlSWQiOjQsImlhdCI6MTY5NDUwMzM5MywiZXhwIjoxNjk3MDk1MzkzLCJpc3MiOiJ5c3l1c2VyIn0.6YEGd9PMlB43CHTjvOsRWVc11gr0ryiIzuEpMGJZNhk', // notebook
    // 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImN1cElkIjpudWxsLCJyb2xlSWQiOjQsImlhdCI6MTY5NDk2OTc2NSwiZXhwIjoxNjk3NTYxNzY1LCJpc3MiOiJ5c3l1c2VyIn0._Op578kn8MNoJLQjH4o0e7U0YuHeCkJGEpgwE-Mmic0', // Desktop
    // getToken(),
    // 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjI1LCJjdXBJZCI6bnVsbCwicm9sZSI6MSwiaWF0IjoxNjgyOTI1MzUzLCJleHAiOjE2ODU1MTczNTMsImlzcyI6InlzeXVzZXIifQ.QwbRdP-l9ZGdx2lPWSPWDkKDEuP0CbxP1seHkYgOLVs',
  },
});

apiClient.interceptors.request.use(async config => {
  // 토큰을 비동기적으로 가져오고 설정합니다.
  const token = await getToken();
  config.headers.Authorization = token;
  return config;
});

export const API = {
  get: async (url: string, data?: any) => {
    const response = await apiClient.get(url, { params: data }).then(res => {
      return res.data;
    });
    return response;
  },
  post: async (url: string, data?: any) => {
    console.log(url);
    const response = await apiClient
      .post(url, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(res => {
        return res.data;
      });
    return response;
  },
  post_formdata: async (url: string, data?: any) => {
    try {
      const formData = new FormData();

      Object.entries(data).map(([k, v]) => {
        formData.append(k, v);
      });

      const response = await apiClient.postForm(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response;
    } catch (error) {
      console.log(error);
      return error;
    }
  },
  patch: async (url: string, data?: any) => {
    const response = await apiClient
      .patch(url, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(res => {
        return res.data;
      });
    return response;
  },
  patch_formdata: async (url: string, data?: any) => {
    try {
      const formData = new FormData();

      formData.append('thumbnail', {
        uri: data.uri,
        name: data.name,
        size: data.size,
        type: data.type,
      });

      const response = await apiClient.patch(url, formData, {
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error: any) {
      console.log(error.response.data);
      return error;
    }
  },
  delete: async (url: string, config?: AxiosRequestConfig) => {
    const response = await apiClient.delete(url, config).then(res => {
      return res.data;
    });
    return response;
  },
};

/*
function MyComponent() {
  const callAPI = async () => {
    const response = await axios
      .get(`${API_BASE_URL}${'/user/me'}`, {
        headers: headers, // 설정한 헤더를 여기에 전달합니다.
      })
      .then(response => {
        // 성공적으로 데이터를 받아왔을 때 처리
        console.log(response.data);
      })
      .catch(error => {
        // 오류 처리
        console.error(error);
      });

    return response;
  };

  const { data, error, isLoading } = useQuery('userme', callAPI);

  const callQuery = () => {
    // 데이터 확인은 이 함수 내에서 수행
    if (!isLoading) {
      if (error) {
        console.error(error);
      } else {
        console.log(data);
      }
    }
  };

  const openSortModal = () => {
    callQuery(); // callQuery 함수 호출
  };

  openSortModal();
}

*/
