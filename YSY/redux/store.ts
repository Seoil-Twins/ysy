import { configureStore } from '@reduxjs/toolkit';
import { loginStatusSlice } from '../features/loginStatusSlice';
import { loadingStatusSlice } from '../features/loadingSlice';

const store = configureStore({
  reducer: {
    loginStatus: loginStatusSlice.reducer,
    loadingStatus: loadingStatusSlice.reducer,
  },
  devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
