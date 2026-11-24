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
  currency?: string;
  budget_limit?: number;
}

export type UpdateTripData = Partial<CreateTripData>;

export interface TripDetailsResponse {
  trip: Trip;
  members: any[];
  activities: Activity[];
  expenses: Expense[];
}

export const tripsApi = {
  async getTrips(): Promise<ApiResponse<{ trips: Trip[] }>> {
    return apiClient.get<{ trips: Trip[] }>('/api/trips');
  },

  async createTrip(data: CreateTripData): Promise<ApiResponse<{ trip: Trip }>> {
    return apiClient.post<{ trip: Trip }>('/api/trips', data);
  },

  async getTripById(tripId: string): Promise<ApiResponse<TripDetailsResponse>> {
    return apiClient.get<TripDetailsResponse>(`/api/trips/${tripId}`);
  },

  async getTrip(tripId: string): Promise<ApiResponse<TripDetailsResponse>> {
    return apiClient.get<TripDetailsResponse>(`/api/trips/${tripId}`);
  },

  async updateTrip(tripId: string, data: UpdateTripData): Promise<ApiResponse<{ trip: Trip }>> {
    return apiClient.put<{ trip: Trip }>(`/api/trips/${tripId}`, data);
  },

  async deleteTrip(tripId: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete<{ message: string }>(`/api/trips/${tripId}`);
  },
};
