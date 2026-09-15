import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/** Why the sign-in dialog was opened, so it can say what it is for. */
export type AuthReason = 'signin' | 'signup' | 'wishlist' | 'cart' | null;

interface UiState {
  isMobileNavOpen: boolean;
  isAnnouncementVisible: boolean;
  isSearchOpen: boolean;
  authReason: AuthReason;
}

const initialState: UiState = {
  isMobileNavOpen: false,
  isAnnouncementVisible: true,
  isSearchOpen: false,
  authReason: null,
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
    openAuth(state, action: PayloadAction<Exclude<AuthReason, null>>) {
      state.authReason = action.payload;
      state.isMobileNavOpen = false;
      state.isSearchOpen = false;
    },
    closeAuth(state) {
      state.authReason = null;
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
  openAuth,
  closeAuth,
  dismissAnnouncement,
  setAnnouncementVisible,
} = uiSlice.actions;
export default uiSlice.reducer;
