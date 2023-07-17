import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../redux/store';

export interface LoadingStatusState {
  isLoading: boolean;
}

const initialState: LoadingStatusState = { isLoading: false };

export const loadingStatusSlice = createSlice({
  name: 'loadingStatus',
  initialState,
  reducers: {
    onLoading: state => {
      state.isLoading = true;
    },
    offLoading: state => {
      state.isLoading = false;
    },
  },
});

export const { onLoading, offLoading } = loadingStatusSlice.actions;
export const selectLogin = (state: RootState) => state.loginStatus.isLogin;
export default loadingStatusSlice.reducer;
