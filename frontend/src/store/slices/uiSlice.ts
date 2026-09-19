import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/** Why the sign-in dialog was opened, so it can say what it is for. */
export type AuthReason = 'signin' | 'signup' | 'wishlist' | 'cart' | null;

interface UiState {
  isMobileNavOpen: boolean;
  isAnnouncementVisible: boolean;
  isSearchOpen: boolean;
  authReason: AuthReason;
  /** The bag is a drawer at every width — there is no separate cart page. */
  isCartOpen: boolean;
}

const initialState: UiState = {
  isMobileNavOpen: false,
  isAnnouncementVisible: true,
  isSearchOpen: false,
  authReason: null,
  isCartOpen: false,
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
      // The sign-in dialog sits above the bag; leaving both open would trap
      // scroll behind two layers and give Escape two things to close.
      state.isCartOpen = false;
    },
    closeAuth(state) {
      state.authReason = null;
    },
    openCart(state) {
      state.isCartOpen = true;
      state.isMobileNavOpen = false;
      state.isSearchOpen = false;
    },
    closeCart(state) {
      state.isCartOpen = false;
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
  openCart,
  closeCart,
  dismissAnnouncement,
  setAnnouncementVisible,
} = uiSlice.actions;
export default uiSlice.reducer;
