// ============================================
// Activities API Service - Frontend
// ============================================

import { apiClient, ApiResponse } from './client';
import { Activity } from '@/types';

export interface CreateActivityData {
  trip_id: string;
  title: string;
  activity_date: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  order_index?: number;
}

export interface UpdateActivityData {
  id: string;
  title?: string;
  activity_date?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  order_index?: number;
}

export const activitiesApi = {
  /**
   * Create new activity
   */
  async createActivity(data: CreateActivityData): Promise<ApiResponse<{ activity: Activity }>> {
    return apiClient.post<{ activity: Activity }>('/api/activities', data);
  },

  /**
   * Update activity
   */
  async updateActivity(data: UpdateActivityData): Promise<ApiResponse<{ activity: Activity }>> {
    return apiClient.put<{ activity: Activity }>('/api/activities', data);
  },

  /**
   * Delete activity
   */
  async deleteActivity(activityId: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete<{ message: string }>(`/api/activities?id=${activityId}`);
  },
};
