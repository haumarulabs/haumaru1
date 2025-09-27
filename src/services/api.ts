// API Service for communicating with the backend

import { ApiResponse, LoginRequest, LoginResponse, User, VPNProfile, Plan, Session, Receipt, IssueVPNRequest, ExtendVPNRequest, RevokeVPNRequest, PaginatedResponse } from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiService {
  private token: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.loadTokens();
  }

  private loadTokens() {
    this.token = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');
  }

  private saveTokens(access: string, refresh?: string) {
    this.token = access;
    localStorage.setItem('access_token', access);
    if (refresh) {
      this.refreshToken = refresh;
      localStorage.setItem('refresh_token', refresh);
    }
  }

  private clearTokens() {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (response.status === 401 && this.refreshToken) {
        // Try to refresh token
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Retry with new token
          headers['Authorization'] = `Bearer ${this.token}`;
          const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
          });
          const data = await retryResponse.json();
          return { ok: retryResponse.ok, data, error: retryResponse.ok ? undefined : data.detail };
        }
      }

      const data = await response.json();
      return { ok: response.ok, data, error: response.ok ? undefined : data.detail };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : 'Network error' };
    }
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: this.refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.saveTokens(data.access_token, data.refresh_token);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    this.clearTokens();
    return false;
  }

  // Auth endpoints
  async login(request: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    if (response.ok && response.data) {
      this.saveTokens(response.data.access_token, response.data.refresh_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response;
  }

  async logout(): Promise<void> {
    await this.request('/auth/logout', { method: 'POST' });
    this.clearTokens();
  }

  async register(userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // User endpoints
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>('/api/user/profile');
  }

  async updateProfile(updates: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async getUsers(page = 1, limit = 20, search?: string): Promise<ApiResponse<PaginatedResponse<User>>> {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (search) params.append('search', search);
    return this.request<PaginatedResponse<User>>(`/api/admin/users?${params}`);
  }

  async activateUser(userId: string): Promise<ApiResponse<User>> {
    return this.request<User>(`/api/admin/users/${userId}/activate`, {
      method: 'POST',
    });
  }

  async deactivateUser(userId: string): Promise<ApiResponse<User>> {
    return this.request<User>(`/api/admin/users/${userId}/deactivate`, {
      method: 'POST',
    });
  }

  // VPN endpoints
  async getVPNProfiles(): Promise<ApiResponse<VPNProfile[]>> {
    return this.request<VPNProfile[]>('/api/vpn/list');
  }

  async issueVPN(request: IssueVPNRequest): Promise<ApiResponse<VPNProfile>> {
    return this.request<VPNProfile>('/api/vpn/issue', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async extendVPN(request: ExtendVPNRequest): Promise<ApiResponse<VPNProfile>> {
    return this.request<VPNProfile>('/api/vpn/extend', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async revokeVPN(request: RevokeVPNRequest): Promise<ApiResponse> {
    return this.request('/api/vpn/revoke', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async downloadVPNProfile(cn: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/vpn/download/${cn}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cn}.ovpn`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  }

  // Plan endpoints
  async getPlans(): Promise<ApiResponse<Plan[]>> {
    return this.request<Plan[]>('/api/plans');
  }

  async createPlan(plan: Partial<Plan>): Promise<ApiResponse<Plan>> {
    return this.request<Plan>('/api/admin/plans', {
      method: 'POST',
      body: JSON.stringify(plan),
    });
  }

  async updatePlan(planId: string, updates: Partial<Plan>): Promise<ApiResponse<Plan>> {
    return this.request<Plan>(`/api/admin/plans/${planId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Session endpoints
  async getSessions(page = 1, limit = 20, cn?: string): Promise<ApiResponse<PaginatedResponse<Session>>> {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (cn) params.append('cn', cn);
    return this.request<PaginatedResponse<Session>>(`/api/sessions?${params}`);
  }

  // Receipt endpoints
  async getReceipts(page = 1, limit = 20): Promise<ApiResponse<PaginatedResponse<Receipt>>> {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    return this.request<PaginatedResponse<Receipt>>(`/api/receipts?${params}`);
  }

  // Stripe endpoints
  async createCheckoutSession(planId: string): Promise<ApiResponse<{ url: string }>> {
    return this.request<{ url: string }>('/api/stripe/checkout', {
      method: 'POST',
      body: JSON.stringify({ plan_id: planId }),
    });
  }

  async createPortalSession(): Promise<ApiResponse<{ url: string }>> {
    return this.request<{ url: string }>('/api/stripe/portal', {
      method: 'POST',
    });
  }
}

export default new ApiService();