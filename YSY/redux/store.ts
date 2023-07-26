import { configureStore } from '@reduxjs/toolkit';
import { loginStatusSlice } from '../features/loginStatusSlice';
import { loadingStatusSlice } from '../features/loadingSlice';
import { albumStatusSlice } from '../features/albumSlice';

const store = configureStore({
  reducer: {
    loginStatus: loginStatusSlice.reducer,
    loadingStatus: loadingStatusSlice.reducer,
    albumStatus: albumStatusSlice.reducer,
  },
  devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
