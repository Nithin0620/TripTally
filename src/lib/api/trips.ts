// ============================================
// Trips API Service - Frontend
// ============================================

import { apiClient, ApiResponse } from './client';
import { Trip, Activity, Expense, TripMember, TripRole } from '@/types';

export interface CreateTripData {
  title: string;
  destination?: string;
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
  members: TripMember[];
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

  async getMembers(tripId: string): Promise<ApiResponse<{ members: TripMember[] }>> {
    return apiClient.get<{ members: TripMember[] }>(`/api/trips/${tripId}/members`);
  },

  async updateMemberRole(
    tripId: string,
    userId: string,
    role: TripRole
  ): Promise<ApiResponse<{ member: TripMember }>> {
    return apiClient.patch<{ member: TripMember }>(
      `/api/trips/${tripId}/members/${userId}`,
      { role }
    );
  },

  async removeMember(
    tripId: string,
    userId: string
  ): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.delete<{ success: boolean }>(`/api/trips/${tripId}/members/${userId}`);
  },

  async deleteTrip(tripId: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete<{ message: string }>(`/api/trips/${tripId}`);
  },
};
