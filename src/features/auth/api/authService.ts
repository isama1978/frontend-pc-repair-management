import { apiClient } from '../../../services/apiClient';
import type { LoginRequest, LoginResponse } from '../types';

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    // POST /auth/login expuesto en la documentación del backend
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },
};