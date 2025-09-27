// API Types based on the Python backend models

export interface User {
  id: string;
  email: string;
  cn?: string;
  name?: string;
  phone?: string;
  birthdate?: string;
  is_active: boolean;
  is_student: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at?: string;
  stripe_customer_id?: string;
}

export interface VPNProfile {
  cn: string;
  role: string;
  expiry_utc: string;
  profile?: string | null;
  days_remaining?: number;
  status?: 'active' | 'expired' | 'revoked';
}

export interface Plan {
  id: string;
  code: string;
  days: number;
  price_usd: number;
  is_active: boolean;
  stripe_price_id?: string;
  description?: string;
}

export interface Session {
  id: string;
  cn: string;
  real_ip: string;
  virtual_ip: string;
  bytes_received: number;
  bytes_sent: number;
  connected_at: string;
  disconnected_at?: string | null;
  duration?: string;
}

export interface Receipt {
  id: string;
  order_id: string;
  amount_usd: number;
  currency: string;
  created_at: string;
  plan?: Plan;
  status?: string;
}

export interface DownloadLog {
  id: string;
  cn: string;
  ip: string;
  user_agent: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  details?: any;
  created_at: string;
  ip?: string;
}

// Request/Response types
export interface LoginRequest {
  email: string;
  password?: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token?: string;
  user: User;
}

export interface IssueVPNRequest {
  role: string;
  days: number;
  name?: string;
  no_confirm?: boolean;
  extra_args?: string[];
}

export interface ExtendVPNRequest {
  cn: string;
  days: number;
  no_confirm?: boolean;
  extra_args?: string[];
}

export interface RevokeVPNRequest {
  cn: string;
  force?: boolean;
}

export interface ApiResponse<T = any> {
  ok: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  ok: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}