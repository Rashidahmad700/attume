import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  isMobileNavOpen: boolean;
  isAnnouncementVisible: boolean;
}

const initialState: UiState = {
  isMobileNavOpen: false,
  isAnnouncementVisible: true,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleMobileNav(state) {
      state.isMobileNavOpen = !state.isMobileNavOpen;
    },
    setMobileNav(state, action: PayloadAction<boolean>) {
      state.isMobileNavOpen = action.payload;
    },
    dismissAnnouncement(state) {
      state.isAnnouncementVisible = false;
    },
    setAnnouncementVisible(state, action: PayloadAction<boolean>) {
      state.isAnnouncementVisible = action.payload;
    },
  },
});

export const { toggleMobileNav, setMobileNav, dismissAnnouncement, setAnnouncementVisible } =
  uiSlice.actions;
export default uiSlice.reducer;
