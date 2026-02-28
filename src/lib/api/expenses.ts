// ============================================
// Expenses API Service - Frontend
// ============================================

import { apiClient, ApiResponse } from './client';
import { Expense } from '@/types';

export interface CreateExpenseData {
  trip_id: string;
  title: string;
  amount: number;
  paid_by: string;
  split_type: 'equal' | 'percentage' | 'custom';
  category?: string;
  shares: {
    user_id: string;
    share_amount: number;
  }[];
}

export const expensesApi = {
  /**
   * Get expenses for a trip
   */
  async getExpenses(tripId: string): Promise<ApiResponse<{ expenses: Expense[] }>> {
    return apiClient.get<{ expenses: Expense[] }>(`/api/expenses?tripId=${tripId}`);
  },

  /**
   * Create new expense
   */
  async createExpense(data: CreateExpenseData): Promise<ApiResponse<{ expense: Expense }>> {
    return apiClient.post<{ expense: Expense }>('/api/expenses', data);
  },

  /**
   * Delete expense
   */
  async deleteExpense(expenseId: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete<{ message: string }>(`/api/expenses?id=${expenseId}`);
  },
};
