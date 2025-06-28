import { AxiosResponse } from 'axios';
import { BaseApiService, ApiResponse } from './base';
import { Category } from '../../types';

export class CategoriesApiService extends BaseApiService {
  async getCategories(): Promise<{ success: boolean; data?: Category[]; error?: string }> {
    try {
      const response: AxiosResponse<ApiResponse<Category[]>> = await this.axiosInstance.get('/categories');
      
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      
      return { success: false, error: response.data.error?.message || 'Failed to fetch categories' };
    } catch (error) {
      return { success: false, error: this.handleApiError(error) };
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
      return { success: false, error: this.handleApiError(error) };
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
      return { success: false, error: this.handleApiError(error) };
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
      return { success: false, error: this.handleApiError(error) };
    }
  }

  async getCategoryById(id: string): Promise<{ success: boolean; data?: Category; error?: string }> {
    try {
      const response: AxiosResponse<ApiResponse<Category>> = await this.axiosInstance.get(`/categories/${id}`);
      
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      
      return { success: false, error: response.data.error?.message || 'Failed to fetch category' };
    } catch (error) {
      return { success: false, error: this.handleApiError(error) };
    }
  }
}

export const categoriesApi = new CategoriesApiService();