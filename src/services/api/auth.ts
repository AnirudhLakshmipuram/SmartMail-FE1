import { AxiosResponse } from 'axios';
import { BaseApiService, ApiResponse } from './base';
import { User } from '../../types';

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export class AuthApiService extends BaseApiService {
  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response: AxiosResponse<ApiResponse<AuthResponse>> = 
        await this.axiosInstance.post('/auth/login', {
          email,
          password
        });
      
      if (response.data.success && response.data.data) {
        const { user, access_token, refresh_token } = response.data.data;
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        return { success: true, user };
      }
      
      return { success: false, error: response.data.error?.message || 'Login failed' };
    } catch (error) {
      return { success: false, error: this.handleApiError(error) };
    }
  }

  async register(email: string, password: string, name: string, domain?: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response: AxiosResponse<ApiResponse<AuthResponse>> = 
        await this.axiosInstance.post('/auth/register', {
          email,
          password,
          name,
          domain
        });
      
      if (response.data.success && response.data.data) {
        const { user, access_token, refresh_token } = response.data.data;
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        return { success: true, user };
      }
      
      return { success: false, error: response.data.error?.message || 'Registration failed' };
    } catch (error) {
      return { success: false, error: this.handleApiError(error) };
    }
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await this.axiosInstance.post('/auth/logout', {
          refresh_token: refreshToken
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuthData();
    }
  }

  async refreshUserToken(): Promise<boolean> {
    return this.refreshToken();
  }
}

export const authApi = new AuthApiService();