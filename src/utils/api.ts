const API_BASE_URL = import.meta.env.VITE_API_URL || '';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = this.baseURL ? `${this.baseURL}${endpoint}` : endpoint;
      const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      // Handle non-JSON responses
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        return { error: text || `HTTP ${response.status}: ${response.statusText}` };
      }

      if (!response.ok) {
        // 401 (Unauthorized) is expected for unauthenticated requests - don't treat as error
        if (response.status === 401) {
          return { error: undefined }; // Return no error, just no data
        }
        return { error: data.error || `Request failed: ${response.status} ${response.statusText}` };
      }

      return { data };
    } catch (error) {
      console.error('API request error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      return { error: errorMessage };
    }
  }

  async register(email: string, password: string) {
    return this.request<{ user: { id: string; email: string } }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async login(email: string, password: string) {
    return this.request<{ user: { id: string; email: string } }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    return this.request('/api/auth/logout', {
      method: 'POST',
    });
  }

  async getMe() {
    return this.request<{ user: { id: string; email: string } }>('/api/auth/me');
  }

  async saveLog(log: any) {
    return this.request<{ log: any }>('/api/logs/create', {
      method: 'POST',
      body: JSON.stringify(log),
    });
  }

  async getLogByDate(date: string) {
    return this.request<{ log: any }>(`/api/logs/day?date=${date}`);
  }

  async getWeekLogs(year: number, weekNumber: number) {
    return this.request<{ logs: any[]; summary: any }>(
      `/api/logs/week?year=${year}&week=${weekNumber}`
    );
  }

  async getMonthLogs(year: number, month: number) {
    return this.request<{
      logs: any[];
      dailyHeatmapData: any[];
      weeklyTotals: any[];
      consistencyPercentage: number;
    }>(`/api/logs/month?year=${year}&month=${month}`);
  }
}

export const api = new ApiClient(API_BASE_URL);

