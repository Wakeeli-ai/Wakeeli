import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors (avoid redirect since auth is disabled)
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
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

export const getAgents = () => api.get('/agents/');
export const createAgent = (data: any) => api.post('/agents/', data);
export const deleteAgent = (id: number) => api.delete(`/agents/${id}`);

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
