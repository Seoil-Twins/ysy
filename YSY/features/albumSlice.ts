import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../redux/store';

export interface AlbumStatusState {
  isAlbum: boolean;
}

const initialState: AlbumStatusState = { isAlbum: false };

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
  },
});

export const { albumSelectionOn, albumSelectionOff } = albumStatusSlice.actions;
export const selectAlbum = (state: RootState) => state.albumStatus.isAlbum;
export default albumStatusSlice.reducer;
