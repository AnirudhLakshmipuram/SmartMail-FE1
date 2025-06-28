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

export interface MonitoringStats {
  emails_processed_today: number;
  auto_replies_sent_today: number;
  average_response_time_ms: number;
  last_activity: string;
  monitoring_status: 'active' | 'paused' | 'error';
  uptime_percentage: number;
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

  // Monitoring APIs
  async getMonitoringStats(): Promise<{ success: boolean; data?: MonitoringStats; error?: string }> {
    try {
      const response: AxiosResponse<ApiResponse<MonitoringStats>> = await this.axiosInstance.get('/mailbox/monitoring/stats');
      
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      
      return { success: false, error: response.data.error?.message || 'Failed to fetch monitoring stats' };
    } catch (error) {
      return { success: false, error: this.handleApiError(error) };
    }
  }

  async startMonitoring(): Promise<{ success: boolean; error?: string }> {
    try {
      const response: AxiosResponse<ApiResponse<{ message: string }>> = await this.axiosInstance.post('/mailbox/monitoring/start');
      
      if (response.data.success) {
        return { success: true };
      }
      
      return { success: false, error: response.data.error?.message || 'Failed to start monitoring' };
    } catch (error) {
      return { success: false, error: this.handleApiError(error) };
    }
  }

  async stopMonitoring(): Promise<{ success: boolean; error?: string }> {
    try {
      const response: AxiosResponse<ApiResponse<{ message: string }>> = await this.axiosInstance.post('/mailbox/monitoring/stop');
      
      if (response.data.success) {
        return { success: true };
      }
      
      return { success: false, error: response.data.error?.message || 'Failed to stop monitoring' };
    } catch (error) {
      return { success: false, error: this.handleApiError(error) };
    }
  }

  async getMonitoringStatus(): Promise<{ success: boolean; data?: { status: 'active' | 'paused' | 'error'; uptime: number }; error?: string }> {
    try {
      const response: AxiosResponse<ApiResponse<{ status: 'active' | 'paused' | 'error'; uptime: number }>> = 
        await this.axiosInstance.get('/mailbox/monitoring/status');
      
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      
      return { success: false, error: response.data.error?.message || 'Failed to fetch monitoring status' };
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

  // Email Processing Control
  async pauseEmailProcessing(): Promise<{ success: boolean; error?: string }> {
    try {
      const response: AxiosResponse<ApiResponse<{ message: string }>> = await this.axiosInstance.post('/mailbox/processing/pause');
      
      if (response.data.success) {
        return { success: true };
      }
      
      return { success: false, error: response.data.error?.message || 'Failed to pause email processing' };
    } catch (error) {
      return { success: false, error: this.handleApiError(error) };
    }
  }

  async resumeEmailProcessing(): Promise<{ success: boolean; error?: string }> {
    try {
      const response: AxiosResponse<ApiResponse<{ message: string }>> = await this.axiosInstance.post('/mailbox/processing/resume');
      
      if (response.data.success) {
        return { success: true };
      }
      
      return { success: false, error: response.data.error?.message || 'Failed to resume email processing' };
    } catch (error) {
      return { success: false, error: this.handleApiError(error) };
    }
  }

  // Sync and Health Check
  async syncMailbox(): Promise<{ success: boolean; data?: { synced_emails: number; processing_time_ms: number }; error?: string }> {
    try {
      const response: AxiosResponse<ApiResponse<{ synced_emails: number; processing_time_ms: number }>> = 
        await this.axiosInstance.post('/mailbox/sync');
      
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      
      return { success: false, error: response.data.error?.message || 'Failed to sync mailbox' };
    } catch (error) {
      return { success: false, error: this.handleApiError(error) };
    }
  }

  async healthCheck(): Promise<{ success: boolean; data?: { status: string; last_check: string; issues: string[] }; error?: string }> {
    try {
      const response: AxiosResponse<ApiResponse<{ status: string; last_check: string; issues: string[] }>> = 
        await this.axiosInstance.get('/mailbox/health');
      
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      
      return { success: false, error: response.data.error?.message || 'Failed to perform health check' };
    } catch (error) {
      return { success: false, error: this.handleApiError(error) };
    }
  }
}

export const mailboxApi = new MailboxApiService();