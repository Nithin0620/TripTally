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
  requiresVerification?: boolean;
  emailSent?: boolean;
}

export interface ProfileResponse extends User {
  verificationEmailSent?: boolean;
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
  async googleLogin(googleToken: string): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<AuthResponse>('/api/auth/google', { googleToken });
  },

  /**
   * Logout user
   */
  async logout(): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>('/api/auth/logout');
  },

  async verifyEmail(token: string): Promise<ApiResponse<{ user: User }>> {
    return apiClient.post<{ user: User }>('/api/auth/verify', { token });
  },

  async resendVerification(email: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>('/api/auth/verify/resend', { email });
  },

  async requestPasswordReset(email: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>('/api/auth/password-reset/request', { email });
  },

  async resetPassword(token: string, password: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>('/api/auth/password-reset/confirm', { token, password });
  },

  async getProfile(): Promise<ApiResponse<{ user: ProfileResponse }>> {
    return apiClient.get<{ user: ProfileResponse }>('/api/auth/profile');
  },

  async updateProfile(
    data: { name?: string; email?: string }
  ): Promise<ApiResponse<{ user: ProfileResponse }>> {
    return apiClient.put<{ user: ProfileResponse }>('/api/auth/profile', data);
  },

  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>('/api/auth/password', {
      currentPassword,
      newPassword,
    });
  },

  async deleteAccount(password?: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete<{ message: string }>('/api/auth/account', password ? { password } : undefined);
  },

  async uploadAvatar(file: File): Promise<ApiResponse<{ profile_image: string }>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/auth/profile/avatar', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = response.headers.get('content-type')?.includes('application/json')
        ? await response.json()
        : null;

      if (!response.ok) {
        return {
          error: data?.error || `Avatar upload failed (${response.status})`,
          code: data?.code,
        };
      }

      return { data: data as { profile_image: string } };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  },
};
