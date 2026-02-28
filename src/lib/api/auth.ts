// ============================================
// Auth API Service - Frontend
// ============================================

import { apiClient, ApiResponse } from './client';
import { User } from '@/types';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token?: string;
}

export const authApi = {
  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<AuthResponse>('/api/auth/register', data);
  },

  /**
   * Login user
   */
  async login(data: LoginData): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<AuthResponse>('/api/auth/login', data);
  },

  /**
   * Google OAuth login
   */
  async googleLogin(token: string): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<AuthResponse>('/api/auth/google', { token });
  },

  /**
   * Logout user
   */
  async logout(): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>('/api/auth/logout');
  },
};
