import { AxiosResponse } from 'axios';
import { BaseApiService, ApiResponse } from './base';
import { MailboxConfig } from '../../types';

export interface MailboxConnectionTest {
  connection_status: string;
  message: string;
  inbox_count?: number;
  last_email_date?: string;
}

export interface AutoReplyRule {
  id: string;
  email_address: string;
  enabled: boolean;
  categories: string[];
  confidence_threshold: number;
  keywords: string[];
  schedule: {
    enabled: boolean;
    timezone: string;
    business_hours: {
      start: string;
      end: string;
      days: string[];
    };
  };
  created_at: string;
}

export class MailboxApiService extends BaseApiService {
  async getMailboxConfig(): Promise<{ success: boolean; data?: MailboxConfig; error?: string }> {
    try {
      const response: AxiosResponse<ApiResponse<MailboxConfig>> = await this.axiosInstance.get('/mailbox/configuration');
      
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      
      return { success: false, error: response.data.error?.message || 'Failed to fetch mailbox configuration' };
    } catch (error) {
      return { success: false, error: this.handleApiError(error) };
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
      return { success: false, error: this.handleApiError(error) };
    }
  }

  async configureMailbox(email: string, appPassword: string, autoReplyEmails: string[], confidenceThreshold: number, enabled: boolean): Promise<{ success: boolean; data?: MailboxConfig; error?: string }> {
    try {
      const response: AxiosResponse<ApiResponse<MailboxConfig>> = await this.axiosInstance.post('/mailbox/configure', {
        email,
        app_password: appPassword,
        auto_reply_emails: autoReplyEmails,
        confidence_threshold: confidenceThreshold,
        enabled
      });
      
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      
      return { success: false, error: response.data.error?.message || 'Failed to configure mailbox' };
    } catch (error) {
      return { success: false, error: this.handleApiError(error) };
    }
  }

  async testMailboxConnection(email: string, appPassword: string): Promise<{ success: boolean; data?: MailboxConnectionTest; error?: string }> {
    try {
      const response: AxiosResponse<ApiResponse<MailboxConnectionTest>> = await this.axiosInstance.post('/mailbox/test-connection', {
        email,
        app_password: appPassword
      });
      
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      
      return { success: false, error: response.data.error?.message || 'Connection test failed' };
    } catch (error) {
      return { success: false, error: this.handleApiError(error) };
    }
  }

  // Auto-Reply Rules Management
  async getAutoReplyRules(): Promise<{ success: boolean; data?: AutoReplyRule[]; error?: string }> {
    try {
      const response: AxiosResponse<ApiResponse<AutoReplyRule[]>> = await this.axiosInstance.get('/auto-reply/rules');
      
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      
      return { success: false, error: response.data.error?.message || 'Failed to fetch auto-reply rules' };
    } catch (error) {
      return { success: false, error: this.handleApiError(error) };
    }
  }

  async createAutoReplyRule(rule: Omit<AutoReplyRule, 'id' | 'created_at'>): Promise<{ success: boolean; data?: AutoReplyRule; error?: string }> {
    try {
      const response: AxiosResponse<ApiResponse<AutoReplyRule>> = await this.axiosInstance.post('/auto-reply/rules', rule);
      
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      
      return { success: false, error: response.data.error?.message || 'Failed to create auto-reply rule' };
    } catch (error) {
      return { success: false, error: this.handleApiError(error) };
    }
  }

  async updateAutoReplyRule(id: string, rule: Partial<AutoReplyRule>): Promise<{ success: boolean; data?: AutoReplyRule; error?: string }> {
    try {
      const response: AxiosResponse<ApiResponse<AutoReplyRule>> = await this.axiosInstance.put(`/auto-reply/rules/${id}`, rule);
      
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      
      return { success: false, error: response.data.error?.message || 'Failed to update auto-reply rule' };
    } catch (error) {
      return { success: false, error: this.handleApiError(error) };
    }
  }

  async deleteAutoReplyRule(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response: AxiosResponse<ApiResponse<{ message: string }>> = await this.axiosInstance.delete(`/auto-reply/rules/${id}`);
      
      if (response.data.success) {
        return { success: true };
      }
      
      return { success: false, error: response.data.error?.message || 'Failed to delete auto-reply rule' };
    } catch (error) {
      return { success: false, error: this.handleApiError(error) };
    }
  }

  async toggleAutoReplyRule(id: string, enabled: boolean): Promise<{ success: boolean; data?: AutoReplyRule; error?: string }> {
    try {
      const response: AxiosResponse<ApiResponse<AutoReplyRule>> = await this.axiosInstance.patch(`/auto-reply/rules/${id}/toggle`, {
        enabled
      });
      
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      
      return { success: false, error: response.data.error?.message || 'Failed to toggle auto-reply rule' };
    } catch (error) {
      return { success: false, error: this.handleApiError(error) };
    }
  }
}

export const mailboxApi = new MailboxApiService();