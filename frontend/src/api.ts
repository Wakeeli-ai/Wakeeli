import axios from 'axios';

// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const API_URL = 'https://wakeeli-ai.up.railway.app/api'; // Hardcoded for now

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

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const getListings = () => api.get('/listings/');
export const createListing = (data: any) => api.post('/listings/', data);
export const deleteListing = (id: number) => api.delete(`/listings/${id}`);

export const getAgents = () => api.get('/agents/');
export const createAgent = (data: any) => api.post('/agents/', data);
export const deleteAgent = (id: number) => api.delete(`/agents/${id}`);

export const getConversations = () => api.get('/conversations/');
export const getConversation = (id: number) => api.get(`/conversations/${id}`);

// Auth endpoints
export const login = (username: string, password: string) => 
  api.post('/auth/login', new URLSearchParams({ username, password }), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

export const signup = (username: string, email: string, password: string) =>
  api.post('/auth/signup', {
    username,
    email,
    password
  });

export const getCurrentUser = () => api.get('/auth/me');
