import {configureStore} from '@reduxjs/toolkit';
import {loginStatusSlice} from '../features/loginStatusSlice';

const store = configureStore({
  reducer: {
    loginStatus: loginStatusSlice.reducer,
  },
  devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
