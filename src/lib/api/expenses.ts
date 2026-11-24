// ============================================
// Expenses API Service - Frontend
// ============================================

import { apiClient, ApiResponse } from './client';
import { Expense, SplitType } from '@/types';

export interface CreateExpenseData {
  trip_id: string;
  title: string;
  amount: number;
  paid_by: string;
  split_type: SplitType;
  involved_members: string[];
  percentages?: Record<string, number>;
  custom_shares?: Record<string, number>;
  share_counts?: Record<string, number>;
  notes?: string;
  category?: string;
  expense_date?: string;
  description?: string;
  tags?: string[];
  currency?: string;
  exchange_rate?: number;
}

export interface UpdateExpenseData {
  id: string;
  trip_id: string;
  title?: string;
  amount?: number;
  paid_by?: string;
  split_type?: SplitType;
  category?: string;
  notes?: string;
  expense_date?: string;
  description?: string;
  tags?: string[];
  currency?: string;
  exchange_rate?: number;
  involved_members?: string[];
  percentages?: Record<string, number>;
  custom_shares?: Record<string, number>;
  share_counts?: Record<string, number>;
  shares?: { user_id: string; share_amount: number }[];
}

export const expensesApi = {
  async getExpenses(tripId: string): Promise<ApiResponse<{ expenses: Expense[] }>> {
    return apiClient.get<{ expenses: Expense[] }>(`/api/expenses?tripId=${tripId}`);
  },

  async createExpense(data: CreateExpenseData): Promise<ApiResponse<{ expense: Expense }>> {
    return apiClient.post<{ expense: Expense }>('/api/expenses', data);
  },

  async updateExpense(data: UpdateExpenseData): Promise<ApiResponse<{ expense: Expense }>> {
    return apiClient.put<{ expense: Expense }>('/api/expenses', data);
  },

  async deleteExpense(
    expenseId: string,
    tripId: string
  ): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete<{ message: string }>(`/api/expenses?id=${expenseId}`, {
      id: expenseId,
      trip_id: tripId,
    });
  },
};
