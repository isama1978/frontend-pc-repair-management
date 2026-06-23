export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    fullName: string;
    role: string;
  }
}

export interface AuthState {
  access_token: string | null;
  isAuthenticated: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  userFullName: string | null;
  userRole: string | null;
}