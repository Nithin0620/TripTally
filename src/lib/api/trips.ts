// ============================================
// Trips API Service - Frontend
// ============================================

import { apiClient, ApiResponse } from './client';
import { Trip, Activity, Expense } from '@/types';

export interface CreateTripData {
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  cover_image?: string;
}

export interface TripDetailsResponse {
  trip: Trip;
  members: any[];
  activities: Activity[];
  expenses: Expense[];
}

export const tripsApi = {
  /**
   * Get all user trips
   */
  async getTrips(): Promise<ApiResponse<{ trips: Trip[] }>> {
    return apiClient.get<{ trips: Trip[] }>('/api/trips');
  },

  /**
   * Create new trip
   */
  async createTrip(data: CreateTripData): Promise<ApiResponse<{ trip: Trip }>> {
    return apiClient.post<{ trip: Trip }>('/api/trips', data);
  },

  /**
   * Get trip details
   */
  async getTripById(tripId: string): Promise<ApiResponse<TripDetailsResponse>> {
    return apiClient.get<TripDetailsResponse>(`/api/trips/${tripId}`);
  },

  /**
   * Delete trip
   */
  async deleteTrip(tripId: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete<{ message: string }>(`/api/trips/${tripId}`);
  },
};
