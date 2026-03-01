// ============================================
// Templates & Settlement API Services - Frontend
// ============================================

import { apiClient, ApiResponse } from './client';
import { Template, Settlement } from '@/types';

export interface CreateTemplateData {
  title: string;
  location?: string;
  days?: number;
  budget_range?: string;
  is_public: boolean;
}

export const templatesApi = {
  /**
   * Get all templates
   */
  async getTemplates(): Promise<ApiResponse<{ templates: Template[] }>> {
    return apiClient.get<{ templates: Template[] }>('/api/templates');
  },

  /**
   * Create new template
   */
  async createTemplate(data: CreateTemplateData): Promise<ApiResponse<{ template: Template }>> {
    return apiClient.post<{ template: Template }>('/api/templates', data);
  },
};

export const settlementApi = {
  /**
   * Get settlement for a trip
   */
  async getSettlement(tripId: string): Promise<ApiResponse<{ settlements: Settlement[] }>> {
    return apiClient.get<{ settlements: Settlement[] }>(`/api/settlement/${tripId}`);
  },
};

export const receiptsApi = {
  /**
   * Upload receipt
   */
  async uploadReceipt(expenseId: string, file: File): Promise<ApiResponse<{ receipt: any }>> {
    const formData = new FormData();
    formData.append('expense_id', expenseId);
    formData.append('file', file);

    try {
      const response = await fetch('/api/receipts', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Upload failed' };
      }

      return { data };
    } catch (error) {
      console.error('Receipt upload error:', error);
      return { error: error instanceof Error ? error.message : 'Network error' };
    }
  },
};
