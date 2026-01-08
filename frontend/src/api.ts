import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_URL,
});

export const getListings = () => api.get('/listings/');
export const createListing = (data: any) => api.post('/listings/', data);
export const deleteListing = (id: number) => api.delete(`/listings/${id}`);

export const getAgents = () => api.get('/agents/');
export const createAgent = (data: any) => api.post('/agents/', data);
export const deleteAgent = (id: number) => api.delete(`/agents/${id}`);

export const getConversations = () => api.get('/conversations/');
export const getConversation = (id: number) => api.get(`/conversations/${id}`);
