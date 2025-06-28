import axios, { AxiosInstance, AxiosResponse } from 'axios';

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.email-autoresponder.com/v1';

// Common API Response interfaces
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  };
}

export class BaseApiService {
  protected axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data ? { data: config.data } : '');
        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => {
        console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
        return response;
      },
      async (error) => {
        console.error('❌ Response Error:', error.response?.data || error.message);
        
        if (error.response?.status === 401) {
          // Token expired, try to refresh
          const refreshed = await this.refreshToken();
          if (refreshed && error.config) {
            // Retry the original request
            return this.axiosInstance.request(error.config);
          } else {
            // Refresh failed, redirect to login
            this.clearAuthData();
            window.location.href = '/login';
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  protected async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) return false;

      const response: AxiosResponse<ApiResponse<{ access_token: string; expires_in: number }>> = 
        await this.axiosInstance.post('/auth/refresh', {
          refresh_token: refreshToken
        });

      if (response.data.success && response.data.data) {
        localStorage.setItem('access_token', response.data.data.access_token);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }

  protected clearAuthData(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  protected handleApiError(error: any): string {
    if (axios.isAxiosError(error)) {
      return error.response?.data?.error?.message || error.message;
    }
    return 'Network error - please check your connection';
  }
}