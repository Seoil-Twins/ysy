import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../redux/store';

export interface AlbumStatusState {
  isAlbum: boolean;
  isFunc: string;
}

const initialState: AlbumStatusState = { isAlbum: false, isFunc: 'None' };

export const albumStatusSlice = createSlice({
  name: 'albumStatus',
  initialState,
  reducers: {
    albumSelectionOn: state => {
      state.isAlbum = true;
    },
    albumSelectionOff: state => {
      state.isAlbum = false;
    },
    albumFunc(state, action) {
      state.isFunc = action.payload;
    },
  },
});

export const { albumSelectionOn, albumSelectionOff, albumFunc } =
  albumStatusSlice.actions;
export const selectAlbum = (state: RootState) => state.albumStatus.isAlbum;
export default albumStatusSlice.reducer;
