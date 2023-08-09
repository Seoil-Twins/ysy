import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../redux/store';

export interface ImageStatusState {
  isImage: boolean;
}

const initialState: ImageStatusState = { isImage: false };

export const imageStatusSlice = createSlice({
  name: 'imageStatus',
  initialState,
  reducers: {
    imageSelectionOn: state => {
      state.isImage = true;
    },
    imageSelectionOff: state => {
      state.isImage = false;
    },
  },
});

export const { imageSelectionOn, imageSelectionOff } = imageStatusSlice.actions;
export const selectAlbum = (state: RootState) => state.imageStatus.isImage;
export default imageStatusSlice.reducer;
