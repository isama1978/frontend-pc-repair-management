import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, LoginRequest, LoginResponse } from "../types";
import { authService } from "../api/authService";
import axios from 'axios';

// Recuperamos el token inicial de localStorage si existe
const storedToken = localStorage.getItem("token");

const initialState: AuthState = {
  access_token: storedToken,
  isAuthenticated: !!storedToken,
  status: "idle",
  error: null,
  userFullName: null,
  userRole: null,
};

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      return await authService.login(credentials);
    } catch (error: unknown) {
      // Usamos el type guard seguro de Axios en lugar de 'any'
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Error al iniciar sesión';
        return rejectWithValue(errorMessage);
      }
      return rejectWithValue('Ocurrió un error inesperado');
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.access_token = null;
      state.isAuthenticated = false;
      state.status = "idle";
      state.error = null;
      localStorage.removeItem("token");
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        loginUser.fulfilled,
        (state, action: PayloadAction<LoginResponse>) => {
          state.status = "succeeded";
          state.isAuthenticated = true;
          state.userFullName = action.payload.user.fullName;
          state.userRole = action.payload.user.role;
          state.access_token = action.payload.access_token;
          localStorage.setItem("token", action.payload.access_token);
        },
      )
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
