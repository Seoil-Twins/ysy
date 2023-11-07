import axios, { AxiosError, AxiosRequestConfig } from 'axios';
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
    const response = await apiClient.post(url, data).then(res => {
      return res.data;
    });
    return response;
  },
  post_formdata: async (url: string, data?: any, fileParamName?: string) => {
    try {
      if (fileParamName) {
        const formData = new FormData();
        const imageData = data.images;
        if (imageData) {
          for (const image of imageData) {
            formData.append('images', image);
          }
          formData.append('title', data.title);
          formData.append('contents', data.contents);

          const response = await apiClient.postForm(url, formData, {
            data: formData,
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          return response;
        }
      } else {
        const formData = new FormData();

        if (data) {
          formData.append('images', {
            uri: data.uri,
            name: data.name,
            size: data.size,
            type: data.type,
          });

          const response = await apiClient.postForm(url, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          return response;
        }
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log('error! : ', error.message);
      }

      throw error;
    }
  },
  patch: async (url: string, data?: any) => {
    const response = await apiClient
      .patch(url, data, { headers: { 'Content-Type': 'application/json' } })
      .then(res => {
        return res.data;
      });
    return response;
  },
  patch_formdata: async (url: string, data?: any, fileParamName?: string) => {
    try {
      const formData = new FormData();
      if (!fileParamName) {
        fileParamName = 'thumbnail';
      }
      if (data) {
        formData.append(fileParamName, {
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
      } else {
        const response = await apiClient
          .patch(url, {
            thumbnail: data,
            headers: {
              'Content-Type': 'application/json',
            },
          })
          .then(res => {
            return res.data;
          });
        return response;
      }
    } catch (error: any) {
      console.log(error);
      throw error;
    }
  },
  delete: async (url: string, config?: AxiosRequestConfig) => {
    const response = await apiClient.delete(url, config).then(res => {
      return res.data;
    });
    return response;
  },
};
