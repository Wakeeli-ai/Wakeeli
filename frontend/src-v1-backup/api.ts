import axios from 'axios';
import { toast } from './utils/toast';

export const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export const api = axios.create({
  baseURL: API_URL,
});

// Decode JWT and check if expired (client-side, no library needed)
// JWT uses base64url encoding; convert to standard base64 before calling atob()
export function isTokenExpired(token: string): boolean {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    if (!payload.exp) return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

// Add Authorization header and pre-flight expiry check on every request
api.interceptors.request.use((config) => {
  // Never block or modify the login endpoint - it handles its own auth
  if (config.url === '/auth/login') return config;

  const token = localStorage.getItem('token');
  if (token) {
    // Reject the request immediately if the token is already expired
    // rather than sending a doomed request to the server.
    if (isTokenExpired(token)) {
      localStorage.removeItem('token');
      localStorage.removeItem('wakeeli_authenticated');
      localStorage.removeItem('wakeeli_remember');
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login?expired=1';
      }
      // Abort the request
      const controller = new AbortController();
      controller.abort();
      config.signal = controller.signal;
      return config;
    }
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401 and global network error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    // A 401 on the login endpoint means wrong credentials, not an expired session
    const isLoginEndpoint = error.config?.url === '/auth/login';
    if (status === 401 && !isLoginEndpoint) {
      toast.info('Session expired. Please log in again.');
      localStorage.removeItem('token');
      localStorage.removeItem('wakeeli_authenticated');
      localStorage.removeItem('wakeeli_remember');
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        setTimeout(() => { window.location.href = '/login?expired=1'; }, 1200);
      }
    } else if (status === 403) {
      toast.error('Access denied. You do not have permission for this action.');
    } else if (status === 404) {
      toast.error('Resource not found.');
    } else if (status && status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (!error.response) {
      toast.error('Network error. Check your connection.');
    }
    return Promise.reject(error);
  }
);

export const getListings = () => api.get('/listings/');
export const createListing = (data: any) => api.post('/listings/', data);
export const deleteListing = (id: number) => api.delete(`/listings/${id}`);

export interface MatchedListing {
  id: number;
  title: string;
  listing_type: string;
  property_type: string;
  city: string;
  area: string | null;
  bedrooms: number;
  bathrooms: number;
  built_up_area: number;
  price: number;
  furnishing: string | null;
  match_scores: {
    overall_match: number;
    budget_match: number;
    location_match: number;
    property_type_match: number;
    bedrooms_match: number;
  };
}

export interface MatchListingsResponse {
  listings: MatchedListing[];
  total: number;
}

export const matchListings = (requirements: {
  listing_type?: string;
  location?: string;
  budget_min?: number;
  budget_max?: number;
  bedrooms?: number;
  property_type?: string;
}) => api.get<MatchListingsResponse>('/listings/match', { params: requirements });

export interface Agent {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  total_leads: number;
  live_load_today: number;
  conversion_rate: number;
  avg_response_time: number;
  phone: string;
  specialization: string;
  active_leads: number;
  tours_completed: number;
  deals_closed: number;
}

export const getAgents = () => api.get('/agents/');
export const createAgent = (data: any) => api.post('/agents/', data);
export const deleteAgent = (id: number) => api.delete(`/agents/${id}`);
export const getAgentDetails = (agentId: number) => api.get<Agent>(`/agents/${agentId}`);
export const updateAgent = (agentId: number, data: any) => api.put(`/agents/${agentId}`, data);

export const getConversations = (search?: string) => 
  api.get('/conversations/', { params: search ? { search } : undefined });
export const getConversation = (id: number) => api.get(`/conversations/${id}`);
export const assignAgentToConversation = (conversationId: number, agentId: number) =>
  api.patch(`/conversations/${conversationId}/assign`, { agent_id: agentId });
export const updateConversationStatus = (conversationId: number, status: string) =>
  api.patch(`/conversations/${conversationId}/status`, { status });
export const extractRequirements = (conversationId: number) =>
  api.get(`/conversations/${conversationId}/extract-requirements`);

// Auth endpoints
export interface UserInfo {
  id: number;
  username: string;
  email: string | null;
  role: 'admin' | 'agent';
  is_active: boolean;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: UserInfo;
}

export const login = (username: string, password: string) => 
  api.post<LoginResponse>('/auth/login', new URLSearchParams({ username, password }), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

export const signup = (username: string, email: string, password: string, role: 'admin' | 'agent' = 'agent') =>
  api.post<LoginResponse>('/auth/signup', {
    username,
    email,
    password,
    role
  });

export const getCurrentUser = () => api.get<UserInfo>('/auth/me');

export interface AnalyticsCostsSummary {
  total_spend_usd: number;
  total_calls: number;
  total_conversations: number;
  avg_cost_per_conversation: number;
  cache_hit_rate: number;
}

export interface AnalyticsCostsDailyBreakdown {
  date: string;
  cost_usd: number;
  calls: number;
  cache_hit_rate: number;
}

export interface AnalyticsCostsPerConversation {
  conversation_id: string;
  total_cost_usd: number;
  call_count: number;
  input_tokens: number;
  output_tokens: number;
  cache_read_tokens: number;
  first_call: string;
  last_call: string;
}

export interface AnalyticsCostsModelSplit {
  cost_usd: number;
  calls: number;
}

export interface AnalyticsCostsResponse {
  summary: AnalyticsCostsSummary;
  daily_breakdown: AnalyticsCostsDailyBreakdown[];
  per_conversation: AnalyticsCostsPerConversation[];
  model_split: Record<string, AnalyticsCostsModelSplit>;
}

export const getAnalyticsCosts = (days?: number) =>
  api.get<AnalyticsCostsResponse>('/analytics/costs', { params: { days } });

// Tours (no backend route yet, will 404 gracefully and fall back to mock data)
export const getTours = () => api.get('/tours/');
