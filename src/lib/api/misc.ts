// ============================================
// Templates & Settlement API Services - Frontend
// ============================================

import { apiClient, ApiResponse } from './client';
import { Template, Settlement, SettlementPayment, Receipt, User } from '@/types';

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

export interface SettlementResponse {
  settlements: Settlement[];
  balances: Record<string, number>;
  payments: SettlementPayment[];
  currency: string;
  users: User[];
  summary: {
    totalSettlements: number;
    totalAmount: number;
    totalPaid: number;
    totalExpensed: number;
  };
}

export const settlementApi = {
  /**
   * Get settlement for a trip
   */
  async getSettlement(tripId: string): Promise<ApiResponse<SettlementResponse>> {
    return apiClient.get<SettlementResponse>(`/api/settlement/${tripId}`);
  },

  /**
   * Record a settlement payment
   */
  async recordPayment(
    tripId: string,
    data: {
      from_user_id: string;
      to_user_id: string;
      amount: number;
      currency?: string;
      payment_method?: string;
      notes?: string;
    }
  ): Promise<ApiResponse<{ payment: SettlementPayment; success: boolean }>> {
    return apiClient.post<{ payment: SettlementPayment; success: boolean }>(`/api/settlement/${tripId}`, data);
  },

  /**
   * Delete a recorded payment
   */
  async deletePayment(tripId: string, paymentId: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete<{ message: string }>(`/api/settlement/${tripId}?paymentId=${paymentId}`);
  },

  /**
   * Remind members with outstanding balances to settle up
   */
  async sendReminders(tripId: string): Promise<ApiResponse<{ count: number; success: boolean }>> {
    return apiClient.post<{ count: number; success: boolean }>(`/api/settlement/${tripId}/remind`);
  },
};

export const receiptsApi = {
  /**
   * Upload receipt
   */
  async uploadReceipt(
    expenseId: string,
    tripId: string,
    file: File
  ): Promise<ApiResponse<{ receipt: Receipt }>> {
    const formData = new FormData();
    formData.append('expenseId', expenseId);
    formData.append('tripId', tripId);
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

  /**
   * List receipts for an expense
   */
  async getReceipts(expenseId: string): Promise<ApiResponse<{ receipts: Receipt[] }>> {
    return apiClient.get<{ receipts: Receipt[] }>(`/api/receipts?expenseId=${expenseId}`);
  },

  /**
   * Delete a receipt
   */
  async deleteReceipt(tripId: string, receiptId: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete<{ message: string }>('/api/receipts', {
      tripId,
      receiptId,
    });
  },
};
