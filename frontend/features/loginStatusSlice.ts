import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../redux/store";

export interface LoginStatusState {
  isLogin: boolean;
}

const initialState: LoginStatusState = {
  isLogin: false
};

export const loginStatusSlice = createSlice({
  name: "loginStatus",
  initialState,
  reducers: {
    login: (state) => {
      state.isLogin = true;
    },
    logout: (state) => {
      state.isLogin = false;
    }
  }
});

export const { login, logout } = loginStatusSlice.actions;
export const selectLogin = (state: RootState) => state.loginStatus.isLogin;
export default loginStatusSlice.reducer;
