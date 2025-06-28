import { AxiosResponse } from 'axios';
import { BaseApiService, ApiResponse } from './base';
import { Email } from '../../types';

export interface EmailsParams {
  page?: number;
  limit?: number;
  filter?: string;
  search?: string;
}

export interface AIResponseData {
  response_id: string;
  suggestion: string;
  confidence: number;
  category: string;
  tone: string;
  reasoning: string;
  alternative_suggestions?: Array<{
    suggestion: string;
    tone: string;
    confidence: number;
  }>;
  used_documents?: string[];
  processing_time_ms: number;
}

export interface SendReplyData {
  sent_email_id: string;
  message_id: string;
  sent_at: string;
  status: string;
  recipients: string[];
  delivery_status: string;
}

export class EmailsApiService extends BaseApiService {
  async getEmails(params?: EmailsParams): Promise<{ success: boolean; data?: { emails: Email[]; pagination: any }; error?: string }> {
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
      return { success: false, error: this.handleApiError(error) };
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
      return { success: false, error: this.handleApiError(error) };
    }
  }

  async markEmailAsRead(id: string, isRead: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await this.axiosInstance.patch(`/emails/${id}/read-status`, {
        is_read: isRead
      });
      
      if (response.data.success) {
        return { success: true };
      }
      
      return { success: false, error: response.data.error?.message || 'Failed to update read status' };
    } catch (error) {
      return { success: false, error: this.handleApiError(error) };
    }
  }

  async starEmail(id: string, isStarred: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await this.axiosInstance.patch(`/emails/${id}/star-status`, {
        is_starred: isStarred
      });
      
      if (response.data.success) {
        return { success: true };
      }
      
      return { success: false, error: response.data.error?.message || 'Failed to update star status' };
    } catch (error) {
      return { success: false, error: this.handleApiError(error) };
    }
  }

  async archiveEmail(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await this.axiosInstance.post(`/emails/${id}/archive`);
      
      if (response.data.success) {
        return { success: true };
      }
      
      return { success: false, error: response.data.error?.message || 'Failed to archive email' };
    } catch (error) {
      return { success: false, error: this.handleApiError(error) };
    }
  }

  async deleteEmail(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await this.axiosInstance.delete(`/emails/${id}`);
      
      if (response.data.success) {
        return { success: true };
      }
      
      return { success: false, error: response.data.error?.message || 'Failed to delete email' };
    } catch (error) {
      return { success: false, error: this.handleApiError(error) };
    }
  }

  async generateAIResponse(emailId: string, preferences?: any): Promise<{ success: boolean; data?: AIResponseData; error?: string }> {
    try {
      const response: AxiosResponse<ApiResponse<AIResponseData>> = await this.axiosInstance.post('/ai/generate-response', {
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
      return { success: false, error: this.handleApiError(error) };
    }
  }

  async sendReply(emailId: string, content: string, htmlContent?: string, options?: any): Promise<{ success: boolean; data?: SendReplyData; error?: string }> {
    try {
      const response: AxiosResponse<ApiResponse<SendReplyData>> = await this.axiosInstance.post(`/emails/${emailId}/reply`, {
        content,
        html_content: htmlContent,
        include_signature: true,
        cc: options?.cc || [],
        bcc: options?.bcc || [],
        attachments: options?.attachments || []
      });
      
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      
      return { success: false, error: response.data.error?.message || 'Failed to send reply' };
    } catch (error) {
      return { success: false, error: this.handleApiError(error) };
    }
  }

  async forwardEmail(emailId: string, to: string[], content: string, includeOriginal: boolean = true): Promise<{ success: boolean; data?: SendReplyData; error?: string }> {
    try {
      const response: AxiosResponse<ApiResponse<SendReplyData>> = await this.axiosInstance.post(`/emails/${emailId}/forward`, {
        to,
        content,
        include_original: includeOriginal
      });
      
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      
      return { success: false, error: response.data.error?.message || 'Failed to forward email' };
    } catch (error) {
      return { success: false, error: this.handleApiError(error) };
    }
  }

  async getSentEmails(params?: EmailsParams): Promise<{ success: boolean; data?: { emails: Email[]; pagination: any }; error?: string }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      
      const endpoint = `/emails/sent${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response: AxiosResponse<ApiResponse<{ emails: Email[]; pagination: any }>> = await this.axiosInstance.get(endpoint);
      
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      
      return { success: false, error: response.data.error?.message || 'Failed to fetch sent emails' };
    } catch (error) {
      return { success: false, error: this.handleApiError(error) };
    }
  }
}

export const emailsApi = new EmailsApiService();