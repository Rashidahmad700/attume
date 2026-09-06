import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@/types';
import { authApi } from '../api/authApi';
import { userApi } from '../api/userApi';

interface AuthState {
  user: User | null;
  /** False until the initial /auth/me check settles — gates auth-dependent UI. */
  isInitialised: boolean;
}

const initialState: AuthState = {
  user: null,
  isInitialised: false,
};

/** True for any profile/address mutation that resolved with a fresh user. */
const isProfileMutationFulfilled = (
  action: unknown,
): action is PayloadAction<{ data: { user: User } }> =>
  [
    userApi.endpoints.updateProfile,
    userApi.endpoints.addAddress,
    userApi.endpoints.updateAddress,
    userApi.endpoints.setDefaultAddress,
    userApi.endpoints.deleteAddress,
  ].some((endpoint) => endpoint.matchFulfilled(action));

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
      state.isInitialised = true;
    },
    clearUser(state) {
      state.user = null;
      state.isInitialised = true;
    },
    /** Dispatched by the base query when a refresh attempt fails. */
    sessionExpired(state) {
      state.user = null;
      state.isInitialised = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(authApi.endpoints.getCurrentUser.matchFulfilled, (state, { payload }) => {
        state.user = payload.data.user;
        state.isInitialised = true;
      })
      .addMatcher(authApi.endpoints.getCurrentUser.matchRejected, (state) => {
        state.user = null;
        state.isInitialised = true;
      })
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, { payload }) => {
        state.user = payload.data.user;
        state.isInitialised = true;
      })
      .addMatcher(authApi.endpoints.signup.matchFulfilled, (state, { payload }) => {
        state.user = payload.data.user;
        state.isInitialised = true;
      })
      .addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
        state.user = null;
        state.isInitialised = true;
      })
      // Every profile/address mutation returns the fresh user — keep the slice in step.
      .addMatcher(
        isProfileMutationFulfilled,
        (state, action: PayloadAction<{ data: { user: User } }>) => {
          state.user = action.payload.data.user;
          state.isInitialised = true;
        },
      );
  },
});

export const { setUser, clearUser, sessionExpired } = authSlice.actions;
export default authSlice.reducer;
