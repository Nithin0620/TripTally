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
      // Get token from localStorage if available
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      // Add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(this.buildUrl(endpoint), {
        ...options,
        headers,
        credentials: 'include', // Include cookies for JWT auth
      });

      const contentType = response.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');
      const data = isJson ? await response.json() : null;
      const fallbackText = isJson ? '' : await response.text();

      if (!response.ok) {
        // If 401, clear token as it's invalid
        if (response.status === 401 && token) {
          localStorage.removeItem('auth_token');
        }

        return {
          error:
            (data && typeof data === 'object' && 'error' in data ? String((data as { error?: string }).error) : '') ||
            fallbackText ||
            `Request failed with status ${response.status}`,
        };
      }

      // If response contains a new token, update it in localStorage
      if (data && typeof data === 'object' && 'token' in data) {
        localStorage.setItem('auth_token', (data as { token?: string }).token as string);
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
