import { User, Category, CompanyDocument, Email, MailboxConfig, LogEntry } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.email-autoresponder.com/v1';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('access_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; error?: any }> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Request failed' };
      }

      return { success: true, data: data.data || data };
    } catch (error) {
      console.error('API request failed:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Authentication
  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    const response = await this.request<{ user: User; access_token: string; refresh_token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data) {
      this.token = response.data.access_token;
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
      return { success: true, user: response.data.user };
    }

    return { success: false, error: response.error?.message || 'Login failed' };
  }

  async register(email: string, password: string, name: string, domain?: string): Promise<{ success: boolean; user?: User; error?: string }> {
    const response = await this.request<{ user: User; access_token: string; refresh_token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, domain }),
    });

    if (response.success && response.data) {
      this.token = response.data.access_token;
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
      return { success: true, user: response.data.user };
    }

    return { success: false, error: response.error?.message || 'Registration failed' };
  }

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      await this.request('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    }
    
    this.token = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  // Categories
  async getCategories(): Promise<{ success: boolean; data?: Category[]; error?: string }> {
    const response = await this.request<Category[]>('/categories');
    return response;
  }

  async createCategory(category: Omit<Category, 'id'>): Promise<{ success: boolean; data?: Category; error?: string }> {
    const response = await this.request<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
    return response;
  }

  async updateCategory(id: string, category: Partial<Category>): Promise<{ success: boolean; data?: Category; error?: string }> {
    const response = await this.request<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(category),
    });
    return response;
  }

  async deleteCategory(id: string): Promise<{ success: boolean; error?: string }> {
    const response = await this.request(`/categories/${id}`, {
      method: 'DELETE',
    });
    return response;
  }

  // Documents
  async getDocuments(): Promise<{ success: boolean; data?: CompanyDocument[]; error?: string }> {
    const response = await this.request<{ documents: CompanyDocument[] }>('/documents');
    return { ...response, data: response.data?.documents };
  }

  async uploadDocument(file: File, categories: string[]): Promise<{ success: boolean; data?: CompanyDocument; error?: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('categories', JSON.stringify(categories));

    const response = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.error?.message || 'Upload failed' };
    }

    return { success: true, data: data.data };
  }

  async deleteDocument(id: string): Promise<{ success: boolean; error?: string }> {
    const response = await this.request(`/documents/${id}`, {
      method: 'DELETE',
    });
    return response;
  }

  // Emails
  async getEmails(params?: { page?: number; limit?: number; filter?: string; search?: string }): Promise<{ success: boolean; data?: { emails: Email[]; pagination: any }; error?: string }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.filter) queryParams.append('filter', params.filter);
    if (params?.search) queryParams.append('search', params.search);

    const response = await this.request<{ emails: Email[]; pagination: any }>(`/emails/inbox?${queryParams}`);
    return response;
  }

  async getEmailDetails(id: string): Promise<{ success: boolean; data?: Email; error?: string }> {
    const response = await this.request<Email>(`/emails/${id}`);
    return response;
  }

  async generateAIResponse(emailId: string, preferences?: any): Promise<{ success: boolean; data?: any; error?: string }> {
    const response = await this.request('/ai/generate-response', {
      method: 'POST',
      body: JSON.stringify({
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
      }),
    });
    return response;
  }

  async sendReply(emailId: string, content: string, htmlContent?: string): Promise<{ success: boolean; data?: any; error?: string }> {
    const response = await this.request(`/emails/${emailId}/reply`, {
      method: 'POST',
      body: JSON.stringify({
        content,
        html_content: htmlContent,
        include_signature: true
      }),
    });
    return response;
  }

  // Mailbox Configuration
  async getMailboxConfig(): Promise<{ success: boolean; data?: MailboxConfig; error?: string }> {
    const response = await this.request<MailboxConfig>('/mailbox/configuration');
    return response;
  }

  async updateMailboxConfig(config: MailboxConfig): Promise<{ success: boolean; data?: MailboxConfig; error?: string }> {
    const response = await this.request<MailboxConfig>('/mailbox/configuration', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
    return response;
  }

  async testMailboxConnection(email: string, appPassword: string): Promise<{ success: boolean; data?: any; error?: string }> {
    const response = await this.request('/mailbox/test-connection', {
      method: 'POST',
      body: JSON.stringify({ email, app_password: appPassword }),
    });
    return response;
  }

  // Analytics and Logs
  async getLogs(params?: { page?: number; limit?: number; type?: string; date_from?: string; date_to?: string }): Promise<{ success: boolean; data?: { logs: LogEntry[]; pagination: any }; error?: string }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.date_from) queryParams.append('date_from', params.date_from);
    if (params?.date_to) queryParams.append('date_to', params.date_to);

    const response = await this.request<{ logs: LogEntry[]; pagination: any }>(`/logs?${queryParams}`);
    return response;
  }

  async getDashboardAnalytics(period?: string): Promise<{ success: boolean; data?: any; error?: string }> {
    const queryParams = new URLSearchParams();
    if (period) queryParams.append('period', period);

    const response = await this.request(`/analytics/dashboard?${queryParams}`);
    return response;
  }
}

export const apiService = new ApiService();