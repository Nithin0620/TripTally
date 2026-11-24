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
  trip_id: string;
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
  async deleteActivity(
    activityId: string,
    tripId: string
  ): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete<{ message: string }>(`/api/activities?id=${activityId}`, {
      id: activityId,
      trip_id: tripId,
    });
  },

  /**
   * Reorder activities
   */
  async reorderActivities(
    tripId: string,
    activities: Array<{ id: string; order_index: number }>
  ): Promise<ApiResponse<{ message: string }>> {
    const results = await Promise.all(
      activities.map(({ id, order_index }) =>
        apiClient.put<{ activity: Activity }>('/api/activities', {
          id,
          trip_id: tripId,
          order_index,
        })
      )
    );
    const error = results.find((r) => r.error);
    if (error) return { error: error.error };
    return { data: { message: 'Reordered successfully' } };
  },
};
