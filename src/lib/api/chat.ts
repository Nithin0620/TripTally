import { apiClient, ApiResponse } from "./client";
import { ChatMessage } from "@/types";

export interface ChatMessagesResponse {
  messages: ChatMessage[];
}

export interface SendMessageResponse {
  message: ChatMessage;
}

export const chatApi = {
  async getMessages(tripId: string): Promise<ApiResponse<ChatMessagesResponse>> {
    return apiClient.get<ChatMessagesResponse>(`/api/trips/${tripId}/messages`);
  },

  async sendMessage(
    tripId: string,
    content: string
  ): Promise<ApiResponse<SendMessageResponse>> {
    return apiClient.post<SendMessageResponse>(`/api/trips/${tripId}/messages`, { content });
  },
};
