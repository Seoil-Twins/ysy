import { API } from '../util/API';

export interface Login {
  email: string;
  snsId: string;
  snsKind: string;
}

export const authAPI = {
  login: async (loginData: Login) => {
    const data = await API.post('/auth/login', loginData);
    return data;
  },
};
