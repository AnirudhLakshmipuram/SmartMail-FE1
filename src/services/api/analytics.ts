import { AxiosResponse } from 'axios';
import { BaseApiService, ApiResponse } from './base';
import { LogEntry } from '../../types';

export interface LogsParams {
  page?: number;
  limit?: number;
  type?: string;
  email?: string;
  date_from?: string;
  date_to?: string;
  confidence_min?: number;
  confidence_max?: number;
}

export interface DashboardAnalytics {
  summary: {
    total_emails: number;
    ai_responses_generated: number;
    auto_sent: number;
    manually_approved: number;
    success_rate: number;
    average_confidence: number;
    average_response_time_ms: number;
  };
  trends: {
    daily_volumes: Array<{
      date: string;
      emails_received: number;
      responses_sent: number;
      success_rate: number;
    }>;
  };
  category_breakdown: Array<{
    category: string;
    count: number;
    success_rate: number;
    average_confidence: number;
  }>;
  confidence_distribution: {
    high: number;
    medium: number;
    low: number;
  };
}

export class AnalyticsApiService extends BaseApiService {
  async getLogs(params?: LogsParams): Promise<{ success: boolean; data?: { logs: LogEntry[]; pagination: any }; error?: string }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.type) queryParams.append('type', params.type);
      if (params?.email) queryParams.append('email', params.email);
      if (params?.date_from) queryParams.append('date_from', params.date_from);
      if (params?.date_to) queryParams.append('date_to', params.date_to);
      if (params?.confidence_min) queryParams.append('confidence_min', params.confidence_min.toString());
      if (params?.confidence_max) queryParams.append('confidence_max', params.confidence_max.toString());
      
      const endpoint = `/logs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response: AxiosResponse<ApiResponse<{ logs: LogEntry[]; pagination: any }>> = await this.axiosInstance.get(endpoint);
      
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      
      return { success: false, error: response.data.error?.message || 'Failed to fetch logs' };
    } catch (error) {
      return { success: false, error: this.handleApiError(error) };
    }
  }

  async getDashboardAnalytics(period?: string, timezone?: string): Promise<{ success: boolean; data?: DashboardAnalytics; error?: string }> {
    try {
      const queryParams = new URLSearchParams();
      if (period) queryParams.append('period', period);
      if (timezone) queryParams.append('timezone', timezone);
      
      const endpoint = `/analytics/dashboard${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response: AxiosResponse<ApiResponse<DashboardAnalytics>> = await this.axiosInstance.get(endpoint);
      
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      
      return { success: false, error: response.data.error?.message || 'Failed to fetch analytics' };
    } catch (error) {
      return { success: false, error: this.handleApiError(error) };
    }
  }

  async exportLogs(format: 'csv' | 'json' | 'xlsx', params?: LogsParams): Promise<{ success: boolean; data?: Blob; error?: string }> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('format', format);
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
      }
      
      const response: AxiosResponse<Blob> = await this.axiosInstance.get(`/logs/export?${queryParams.toString()}`, {
        responseType: 'blob'
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: this.handleApiError(error) };
    }
  }

  async getAIResponseHistory(params?: { email_id?: string; confidence_min?: number; page?: number; limit?: number }): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.email_id) queryParams.append('email_id', params.email_id);
      if (params?.confidence_min) queryParams.append('confidence_min', params.confidence_min.toString());
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      
      const endpoint = `/ai/responses${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response: AxiosResponse<ApiResponse<any[]>> = await this.axiosInstance.get(endpoint);
      
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      
      return { success: false, error: response.data.error?.message || 'Failed to fetch AI response history' };
    } catch (error) {
      return { success: false, error: this.handleApiError(error) };
    }
  }

  async approveAIResponse(responseId: string, editedContent?: string, sendImmediately: boolean = false): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await this.axiosInstance.post(`/ai/responses/${responseId}/approve`, {
        edited_content: editedContent,
        send_immediately: sendImmediately
      });
      
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      
      return { success: false, error: response.data.error?.message || 'Failed to approve AI response' };
    } catch (error) {
      return { success: false, error: this.handleApiError(error) };
    }
  }

  async rejectAIResponse(responseId: string, reason: string, feedback?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await this.axiosInstance.post(`/ai/responses/${responseId}/reject`, {
        reason,
        feedback
      });
      
      if (response.data.success) {
        return { success: true };
      }
      
      return { success: false, error: response.data.error?.message || 'Failed to reject AI response' };
    } catch (error) {
      return { success: false, error: this.handleApiError(error) };
    }
  }
}

export const analyticsApi = new AnalyticsApiService();