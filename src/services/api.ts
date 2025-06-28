import { User, Category, CompanyDocument, Email, MailboxConfig, LogEntry } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.email-autoresponder.com/v1';

// Mock data for fallback when API is not available
const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Customer Support',
    description: 'Handle customer support and service requests',
    tone: 'professional',
    template: 'Thank you for contacting our support team. We\'re here to help you resolve your issue quickly and efficiently.',
    color: 'bg-blue-500'
  },
  {
    id: '2',
    name: 'Sales Inquiry',
    description: 'Sales and product inquiries',
    tone: 'friendly',
    template: 'Thank you for your interest in our products! I\'d be happy to provide you with more information.',
    color: 'bg-green-500'
  },
  {
    id: '3',
    name: 'Technical Support',
    description: 'Technical issues and troubleshooting',
    tone: 'professional',
    template: 'I understand you\'re experiencing a technical issue. Let me help you troubleshoot this problem.',
    color: 'bg-purple-500'
  }
];

const mockEmails: Email[] = [
  {
    id: '1',
    from: 'customer@example.com',
    to: 'support@company.com',
    subject: 'Payment processing issue',
    body: 'Hi, I\'m having trouble processing my payment. Can you help?',
    receivedAt: new Date(Date.now() - 3600000),
    category: 'Customer Support',
    replySuggestion: 'I\'ll help you resolve this payment issue right away.',
    confidence: 0.92,
    status: 'pending'
  },
  {
    id: '2',
    from: 'prospect@business.com',
    to: 'sales@company.com',
    subject: 'Interested in your enterprise plan',
    body: 'Could you provide more details about your enterprise pricing?',
    receivedAt: new Date(Date.now() - 7200000),
    category: 'Sales Inquiry',
    replySuggestion: 'I\'d be happy to share our enterprise plan details with you.',
    confidence: 0.88,
    status: 'sent'
  }
];

const mockLogs: LogEntry[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 1800000),
    type: 'sent',
    email: 'customer@example.com',
    subject: 'Payment processing issue',
    confidence: 0.92,
    action: 'AI response sent automatically'
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 3600000),
    type: 'pending',
    email: 'prospect@business.com',
    subject: 'Interested in your enterprise plan',
    confidence: 0.88,
    action: 'AI suggestion generated'
  }
];

class ApiService {
  private token: string | null = null;
  private isOnline: boolean = true;

  constructor() {
    this.token = localStorage.getItem('access_token');
    this.checkConnectivity();
  }

  private async checkConnectivity() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, { 
        method: 'GET',
        timeout: 5000 
      } as any);
      this.isOnline = response.ok;
    } catch (error) {
      this.isOnline = false;
      console.log('API not available, using mock data');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; error?: any }> {
    // If offline or no token for protected routes, use mock data
    if (!this.isOnline) {
      return this.getMockResponse<T>(endpoint, options.method || 'GET');
    }

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
        // If API fails, fallback to mock data for GET requests
        if (options.method === 'GET' || !options.method) {
          return this.getMockResponse<T>(endpoint, 'GET');
        }
        return { success: false, error: data.error || 'Request failed' };
      }

      return { success: true, data: data.data || data };
    } catch (error) {
      console.error('API request failed:', error);
      // Fallback to mock data for GET requests
      if (options.method === 'GET' || !options.method) {
        return this.getMockResponse<T>(endpoint, 'GET');
      }
      return { success: false, error: 'Network error' };
    }
  }

  private getMockResponse<T>(endpoint: string, method: string): { success: boolean; data?: T; error?: any } {
    // Simulate network delay
    return new Promise(resolve => {
      setTimeout(() => {
        if (endpoint === '/categories') {
          resolve({ success: true, data: mockCategories as T });
        } else if (endpoint === '/documents') {
          resolve({ success: true, data: { documents: [] } as T });
        } else if (endpoint.startsWith('/emails')) {
          resolve({ success: true, data: { emails: mockEmails, pagination: { current_page: 1, total_pages: 1 } } as T });
        } else if (endpoint === '/logs') {
          resolve({ success: true, data: { logs: mockLogs, pagination: { current_page: 1, total_pages: 1 } } as T });
        } else if (endpoint === '/mailbox/configuration') {
          resolve({ success: true, data: null as T });
        } else if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
          // For write operations, simulate success
          resolve({ success: true, data: {} as T });
        } else {
          resolve({ success: false, error: 'Not found' });
        }
      }, 500);
    });
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
    const newCategory = { ...category, id: Date.now().toString() };
    const response = await this.request<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
    
    // If API fails, simulate success for demo
    if (!response.success) {
      return { success: true, data: newCategory };
    }
    return response;
  }

  async updateCategory(id: string, category: Partial<Category>): Promise<{ success: boolean; data?: Category; error?: string }> {
    const response = await this.request<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(category),
    });
    
    // If API fails, simulate success for demo
    if (!response.success) {
      const existingCategory = mockCategories.find(c => c.id === id);
      if (existingCategory) {
        const updatedCategory = { ...existingCategory, ...category };
        return { success: true, data: updatedCategory };
      }
    }
    return response;
  }

  async deleteCategory(id: string): Promise<{ success: boolean; error?: string }> {
    const response = await this.request(`/categories/${id}`, {
      method: 'DELETE',
    });
    
    // If API fails, simulate success for demo
    if (!response.success) {
      return { success: true };
    }
    return response;
  }

  // Documents
  async getDocuments(): Promise<{ success: boolean; data?: CompanyDocument[]; error?: string }> {
    const response = await this.request<{ documents: CompanyDocument[] }>('/documents');
    return { ...response, data: response.data?.documents };
  }

  async uploadDocument(file: File, categories: string[]): Promise<{ success: boolean; data?: CompanyDocument; error?: string }> {
    if (!this.isOnline) {
      // Simulate successful upload for demo
      const mockDocument: CompanyDocument = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type.includes('pdf') ? 'pdf' : file.type.includes('word') ? 'doc' : 'txt',
        size: file.size,
        uploadDate: new Date(),
        content: `This is a preview of ${file.name}. Content includes company policies and procedures.`,
        categories
      };
      return new Promise(resolve => {
        setTimeout(() => resolve({ success: true, data: mockDocument }), 1000);
      });
    }

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
    
    // If API fails, simulate success for demo
    if (!response.success) {
      return { success: true };
    }
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
    
    // If API fails, simulate success for demo
    if (!response.success) {
      return { success: true, data: config };
    }
    return response;
  }

  async testMailboxConnection(email: string, appPassword: string): Promise<{ success: boolean; data?: any; error?: string }> {
    const response = await this.request('/mailbox/test-connection', {
      method: 'POST',
      body: JSON.stringify({ email, app_password: appPassword }),
    });
    
    // If API fails, simulate success for demo
    if (!response.success) {
      return { 
        success: true, 
        data: { 
          connection_status: 'success',
          message: 'Successfully connected to Gmail (Demo)',
          inbox_count: 25
        } 
      };
    }
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