export const COLORS = {
  primary: '#4CAF50',
  primaryDark: '#2E7D32',
  background: '#0A0A0A',
  surface: '#1A1A1A',
  surfaceLight: '#2A2A2A',
  border: '#333333',
  text: {
    primary: '#FFFFFF',
    secondary: '#A0A0A0',
    accent: '#4CAF50'
  }
};

export const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;
export const WS_BASE_URL = process.env.EXPO_PUBLIC_WS_BASE_URL;

// API Endpoints
export const API_ENDPOINTS = {
  // User Management
  GET_ALL_USERS: '/users/get/all/',
  SEARCH_USERS: '/users/search_user',
  // Friend Requests
  FRIEND_REQUESTS: '/users/friend-requests/',
  FRIEND_REQUEST_ACTION: (requestId: string) => `/users/friend-requests/${requestId}/`,
  CANCEL_FRIEND_REQUEST: (requestId: string) => `/users/friend-requests/${requestId}/cancel/`,
  // Chat
  CHAT_HISTORY: (username: string) => `/users/api/chat/history/${username}/`,
  SEND_MESSAGE: '/users/api/chat/send/',
  LAST_MESSAGE: (username: string) => `/users/api/chat/last_message/${username}/`,
};