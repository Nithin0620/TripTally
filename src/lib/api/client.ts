// ============================================
// API Client - Base fetch wrapper
// ============================================

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  }

  private buildUrl(endpoint: string): string {
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    if (!this.baseUrl) {
      return normalizedEndpoint;
    }

    const normalizedBase = this.baseUrl.endsWith('/')
      ? this.baseUrl.slice(0, -1)
      : this.baseUrl;

    if (normalizedBase.endsWith('/api') && normalizedEndpoint.startsWith('/api/')) {
      return `${normalizedBase}${normalizedEndpoint.slice(4)}`;
    }

    return `${normalizedBase}${normalizedEndpoint}`;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(this.buildUrl(endpoint), {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'include', // Include cookies for JWT auth
      });

      const contentType = response.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');
      const data = isJson ? await response.json() : null;
      const fallbackText = isJson ? '' : await response.text();

      if (!response.ok) {
        return {
          error:
            (data && typeof data === 'object' && 'error' in data ? String((data as { error?: string }).error) : '') ||
            fallbackText ||
            `Request failed with status ${response.status}`,
        };
      }

      return { data: data as T };
    } catch (error) {
      console.error('API request error:', error);
      return {
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
