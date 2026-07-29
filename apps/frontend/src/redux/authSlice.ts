import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define types for the state
interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
}

// Define the initial state
const initialState: AuthState = {
  isAuthenticated: false,
  accessToken: null,
};

// Create the slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Action to log in and set the access token
    login: (state, action: PayloadAction<string>) => {
      state.isAuthenticated = true;
      state.accessToken = action.payload;
    },
    // Action to log out and clear the access token
    logout: (state) => {
      state.isAuthenticated = false;
      state.accessToken = null;
    },
  },
});

// Export actions for dispatching
export const { login, logout } = authSlice.actions;

// Export the reducer to be added to the store
export default authSlice.reducer;
