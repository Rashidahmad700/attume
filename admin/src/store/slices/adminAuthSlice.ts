import { createSlice } from '@reduxjs/toolkit';
import type { Admin } from '@/types';
import { adminApi } from '../api/adminApi';

interface AdminAuthState {
  admin: Admin | null;
  isInitialised: boolean;
}

const initialState: AdminAuthState = { admin: null, isInitialised: false };

const adminAuthSlice = createSlice({
  name: 'adminAuth',
  initialState,
  reducers: {
    sessionExpired(state) {
      state.admin = null;
      state.isInitialised = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(adminApi.endpoints.getCurrentAdmin.matchFulfilled, (state, { payload }) => {
        state.admin = payload.data.admin;
        state.isInitialised = true;
      })
      .addMatcher(adminApi.endpoints.getCurrentAdmin.matchRejected, (state) => {
        state.admin = null;
        state.isInitialised = true;
      })
      .addMatcher(adminApi.endpoints.login.matchFulfilled, (state, { payload }) => {
        state.admin = payload.data.admin;
        state.isInitialised = true;
      })
      .addMatcher(adminApi.endpoints.logout.matchFulfilled, (state) => {
        state.admin = null;
        state.isInitialised = true;
      });
  },
});

export const { sessionExpired } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;
