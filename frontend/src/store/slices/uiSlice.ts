import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  isMobileNavOpen: boolean;
  isAnnouncementVisible: boolean;
  isSearchOpen: boolean;
}

const initialState: UiState = {
  isMobileNavOpen: false,
  isAnnouncementVisible: true,
  isSearchOpen: false,
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
    setSearchOpen(state, action: PayloadAction<boolean>) {
      state.isSearchOpen = action.payload;
      if (action.payload) state.isMobileNavOpen = false;
    },
    dismissAnnouncement(state) {
      state.isAnnouncementVisible = false;
    },
    setAnnouncementVisible(state, action: PayloadAction<boolean>) {
      state.isAnnouncementVisible = action.payload;
    },
  },
});

export const {
  toggleMobileNav,
  setMobileNav,
  setSearchOpen,
  dismissAnnouncement,
  setAnnouncementVisible,
} = uiSlice.actions;
export default uiSlice.reducer;
