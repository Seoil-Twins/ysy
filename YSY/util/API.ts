import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export const API = {
  get: async (url: string, data?: any) => {
    try {
      const response = await apiClient.get(url, {
        params: data,
      });

      return response;
    } catch (error) {
      return error;
    }
  },
  post: async (url: string, data?: any) => {
    try {
      const response = await apiClient.get(url, {
        params: data,
      });

      return response;
    } catch (error) {
      return error;
    }
  },
  post_formdata: async (url: string, data?: any) => {
    try {
      const formData = new FormData();

      for (const [k, v] of data) {
        formData.append(k, v);
      }

      const response = await apiClient.get(url, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        data: formData,
      });

      return response;
    } catch (error) {
      return error;
    }
  },
};
