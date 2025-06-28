import { AxiosResponse } from 'axios';
import { BaseApiService, ApiResponse, PaginatedResponse } from './base';
import { CompanyDocument } from '../../types';

export interface DocumentsParams {
  category_id?: string;
  type?: string;
  page?: number;
  limit?: number;
}

export class DocumentsApiService extends BaseApiService {
  async getDocuments(params?: DocumentsParams): Promise<{ success: boolean; data?: CompanyDocument[]; error?: string }> {
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
      return { success: false, error: this.handleApiError(error) };
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
      return { success: false, error: this.handleApiError(error) };
    }
  }

  async getDocumentContent(id: string): Promise<{ success: boolean; data?: { id: string; name: string; content: string; metadata: any }; error?: string }> {
    try {
      const response: AxiosResponse<ApiResponse<{ id: string; name: string; content: string; metadata: any }>> = 
        await this.axiosInstance.get(`/documents/${id}/content`);
      
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      
      return { success: false, error: response.data.error?.message || 'Failed to fetch document content' };
    } catch (error) {
      return { success: false, error: this.handleApiError(error) };
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
      return { success: false, error: this.handleApiError(error) };
    }
  }

  async updateDocumentCategories(id: string, categories: string[]): Promise<{ success: boolean; data?: CompanyDocument; error?: string }> {
    try {
      const response: AxiosResponse<ApiResponse<CompanyDocument>> = await this.axiosInstance.put(`/documents/${id}`, {
        categories
      });
      
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      
      return { success: false, error: response.data.error?.message || 'Failed to update document' };
    } catch (error) {
      return { success: false, error: this.handleApiError(error) };
    }
  }
}

export const documentsApi = new DocumentsApiService();