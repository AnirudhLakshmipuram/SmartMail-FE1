import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { User, Category, CompanyDocument, Email, MailboxConfig, LogEntry } from '../types';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.email-autoresponder.com/v1';

// API Response interfaces
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  };
}

class ApiService {
  private axiosInstance: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

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
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }
        }
        
        return Promise.reject(error);
      }
    );

    this.token = localStorage.getItem('access_token');
  }

  // Authentication methods
  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response: AxiosResponse<ApiResponse<{ user: User; access_token: string; refresh_token: string; expires_in: number }>> = 
        await this.axiosInstance.post('/auth/login', {
          email,
          password
        });
      
      if (response.data.success && response.data.data) {
        const { user, access_token, refresh_token } = response.data.data;
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        this.token = access_token;
        return { success: true, user };
      }
      
      return { success: false, error: response.data.error?.message || 'Login failed' };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error?.message || error.message;
        return { success: false, error: message };
      }
      return { success: false, error: 'Network error - please check your connection' };
    }
  }

  async register(email: string, password: string, name: string, domain?: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response: AxiosResponse<ApiResponse<{ user: User; access_token: string; refresh_token: string; expires_in: number }>> = 
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
        this.token = access_token;
        return { success: true, user };
      }
      
      return { success: false, error: response.data.error?.message || 'Registration failed' };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error?.message || error.message;
        return { success: false, error: message };
      }
      return { success: false, error: 'Network error - please check your connection' };
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
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      this.token = null;
    }
  }

  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) return false;

      const response: AxiosResponse<ApiResponse<{ access_token: string; expires_in: number }>> = 
        await this.axiosInstance.post('/auth/refresh', {
          refresh_token: refreshToken
        });

      if (response.data.success && response.data.data) {
        localStorage.setItem('access_token', response.data.data.access_token);
        this.token = response.data.data.access_token;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }

  // Categories API
  async getCategories(): Promise<{ success: boolean; data?: Category[]; error?: string }> {
    try {
      const response: AxiosResponse<ApiResponse<Category[]>> = await this.axiosInstance.get('/categories');
      
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      
      return { success: false, error: response.data.error?.message || 'Failed to fetch categories' };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error?.message || error.message;
        return { success: false, error: message };
      }
      return { success: false, error: 'Network error - please check your connection' };
    }
  }

  async createCategory(category: Omit<Category, 'id'>): Promise<{ success: boolean; data?: Category; error?: string }> {
    try {
      const response: AxiosResponse<ApiResponse<Category>> = await this.axiosInstance.post('/categories', category);
      
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      
      return { success: false, error: response.data.error?.message || 'Failed to create category' };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error?.message || error.message;
        return { success: false, error: message };
      }
      return { success: false, error: 'Network error - please check your connection' };
    }
  }

  async updateCategory(id: string, category: Partial<Category>): Promise<{ success: boolean; data?: Category; error?: string }> {
    try {
      const response: AxiosResponse<ApiResponse<Category>> = await this.axiosInstance.put(`/categories/${id}`, category);
      
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      
      return { success: false, error: response.data.error?.message || 'Failed to update category' };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error?.message || error.message;
        return { success: false, error: message };
      }
      return { success: false, error: 'Network error - please check your connection' };
    }
  }

  async deleteCategory(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response: AxiosResponse<ApiResponse<{ message: string }>> = await this.axiosInstance.delete(`/categories/${id}`);
      
      if (response.data.success) {
        return { success: true };
      }
      
      return { success: false, error: response.data.error?.message || 'Failed to delete category' };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error?.message || error.message;
        return { success: false, error: message };
      }
      return { success: false, error: 'Network error - please check your connection' };
    }
  }

  // Documents API
  async getDocuments(params?: { category_id?: string; type?: string; page?: number; limit?: number }): Promise<{ success: boolean; data?: CompanyDocument[]; error?: string }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.category_id) queryParams.append('category_id', params.category_id);
      if (params?.type) queryParams.append('type', params.type);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      
      const endpoint = `/documents${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response: AxiosResponse<ApiResponse<PaginatedResponse<CompanyDocument>>> = await this.axiosInstance.get(endpoint);
      
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data.data };
      }
      
      return { success: false, error: response.data.error?.message || 'Failed to fetch documents' };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error?.message || error.message;
        return { success: false, error: message };
      }
      return { success: false, error: 'Network error - please check your connection' };
    }
  }

  async uploadDocument(file: File, categories: string[]): Promise<{ success: boolean; data?: CompanyDocument; error?: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('categories', JSON.stringify(categories));
      
      const response: AxiosResponse<ApiResponse<CompanyDocument>> = await this.axiosInstance.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      
      return { success: false, error: response.data.error?.message || 'Failed to upload document' };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error?.message || error.message;
        return { success: false, error: message };
      }
      return { success: false, error: 'Network error - please check your connection' };
    }
  }

  async deleteDocument(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response: AxiosResponse<ApiResponse<{ message: string }>> = await this.axiosInstance.delete(`/documents/${id}`);
      
      if (response.data.success) {
        return { success: true };
      }
      
      return { success: false, error: response.data.error?.message || 'Failed to delete document' };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error?.message || error.message;
        return { success: false, error: message };
      }
      return { success: false, error: 'Network error - please check your connection' };
    }
  }

  // Emails API
  async getEmails(params?: { page?: number; limit?: number; filter?: string; search?: string }): Promise<{ success: boolean; data?: { emails: Email[]; pagination: any }; error?: string }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.filter) queryParams.append('filter', params.filter);
      if (params?.search) queryParams.append('search', params.search);
      
      const endpoint = `/emails/inbox${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response: AxiosResponse<ApiResponse<{ emails: Email[]; pagination: any }>> = await this.axiosInstance.get(endpoint);
      
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      
      return { success: false, error: response.data.error?.message || 'Failed to fetch emails' };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error?.message || error.message;
        return { success: false, error: message };
      }
      return { success: false, error: 'Network error - please check your connection' };
    }
  }

  async getEmailDetails(id: string): Promise<{ success: boolean; data?: Email; error?: string }> {
    try {
      const response: AxiosResponse<ApiResponse<Email>> = await this.axiosInstance.get(`/emails/${id}`);
      
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      
      return { success: false, error: response.data.error?.message || 'Failed to fetch email details' };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error?.message || error.message;
        return { success: false, error: message };
      }
      return { success: false, error: 'Network error - please check your connection' };
    }
  }

  async generateAIResponse(emailId: string, preferences?: any): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await this.axiosInstance.post('/ai/generate-response', {
        email_id: emailId,
        context: {
          sender_history: true,
          company_documents: true,
          previous_conversations: true
        },
        preferences: preferences || {
          tone: 'professional',
          length: 'medium',
          include_signature: true
        }
      });
      
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      
      return { success: false, error: response.data.error?.message || 'Failed to generate AI response' };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error?.message || error.message;
        return { success: false, error: message };
      }
      return { success: false, error: 'Network error - please check your connection' };
    }
  }

  async sendReply(emailId: string, content: string, htmlContent?: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await this.axiosInstance.post(`/emails/${emailId}/reply`, {
        content,
        html_content: htmlContent,
        include_signature: true
      });
      
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      
      return { success: false, error: response.data.error?.message || 'Failed to send reply' };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error?.message || error.message;
        return { success: false, error: message };
      }
      return { success: false, error: 'Network error - please check your connection' };
    }
  }

  // Mailbox Configuration API
  async getMailboxConfig(): Promise<{ success: boolean; data?: MailboxConfig; error?: string }> {
    try {
      const response: AxiosResponse<ApiResponse<MailboxConfig>> = await this.axiosInstance.get('/mailbox/configuration');
      
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      
      return { success: false, error: response.data.error?.message || 'Failed to fetch mailbox configuration' };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error?.message || error.message;
        return { success: false, error: message };
      }
      return { success: false, error: 'Network error - please check your connection' };
    }
  }

  async updateMailboxConfig(config: MailboxConfig): Promise<{ success: boolean; data?: MailboxConfig; error?: string }> {
    try {
      const response: AxiosResponse<ApiResponse<MailboxConfig>> = await this.axiosInstance.put('/mailbox/configuration', config);
      
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      
      return { success: false, error: response.data.error?.message || 'Failed to update mailbox configuration' };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error?.message || error.message;
        return { success: false, error: message };
      }
      return { success: false, error: 'Network error - please check your connection' };
    }
  }

  async testMailboxConnection(email: string, appPassword: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await this.axiosInstance.post('/mailbox/test-connection', {
        email,
        app_password: appPassword
      });
      
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      
      return { success: false, error: response.data.error?.message || 'Connection test failed' };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error?.message || error.message;
        return { success: false, error: message };
      }
      return { success: false, error: 'Network error - please check your connection' };
    }
  }

  // Analytics and Logs API
  async getLogs(params?: { page?: number; limit?: number; type?: string; date_from?: string; date_to?: string }): Promise<{ success: boolean; data?: { logs: LogEntry[]; pagination: any }; error?: string }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.type) queryParams.append('type', params.type);
      if (params?.date_from) queryParams.append('date_from', params.date_from);
      if (params?.date_to) queryParams.append('date_to', params.date_to);
      
      const endpoint = `/logs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response: AxiosResponse<ApiResponse<{ logs: LogEntry[]; pagination: any }>> = await this.axiosInstance.get(endpoint);
      
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      
      return { success: false, error: response.data.error?.message || 'Failed to fetch logs' };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error?.message || error.message;
        return { success: false, error: message };
      }
      return { success: false, error: 'Network error - please check your connection' };
    }
  }

  async getDashboardAnalytics(period?: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const queryParams = period ? `?period=${period}` : '';
      const response: AxiosResponse<ApiResponse<any>> = await this.axiosInstance.get(`/analytics/dashboard${queryParams}`);
      
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      
      return { success: false, error: response.data.error?.message || 'Failed to fetch analytics' };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error?.message || error.message;
        return { success: false, error: message };
      }
      return { success: false, error: 'Network error - please check your connection' };
    }
  }

  // Export logs
  async exportLogs(format: 'csv' | 'json' | 'xlsx', params?: any): Promise<{ success: boolean; data?: Blob; error?: string }> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('format', format);
      if (params) {
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== null) {
            queryParams.append(key, params[key].toString());
          }
        });
      }
      
      const response: AxiosResponse<Blob> = await this.axiosInstance.get(`/logs/export?${queryParams.toString()}`, {
        responseType: 'blob'
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error?.message || error.message;
        return { success: false, error: message };
      }
      return { success: false, error: 'Network error - please check your connection' };
    }
  }
}

export const apiService = new ApiService();