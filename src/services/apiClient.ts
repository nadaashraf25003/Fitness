import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getStoredItem } from '../utils/storageUtils';

// Resolve the API base URL from the environment variable baked in at build time.
//
// .env              (local dev)  → VITE_API_BASE_URL=http://localhost:8000
// .env.production   (Vercel)     → VITE_API_BASE_URL=   (empty string)
//
// When the value is empty/absent in production, axios uses relative paths (baseURL='')
// so all requests go to the same origin and Vercel rewrites route them to the backend.
const _envUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
const API_BASE_URL: string = _envUrl && _envUrl.trim() !== '' ? _envUrl.trim() : '';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Bearer Token to all outgoing requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStoredItem<string | null>('gym_jwt_token', null) || localStorage.getItem('gym_jwt_token');
    if (token && config.headers) {
      const cleanToken = token.startsWith('"') && token.endsWith('"') ? token.slice(1, -1) : token;
      config.headers.Authorization = `Bearer ${cleanToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: 401 Unauthorized handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('gym_jwt_token');
      localStorage.removeItem('gym_current_user');
      const pathname = window.location.pathname;
      const isProtectedRoute =
        pathname.startsWith('/attendance') ||
        pathname.startsWith('/trainers') ||
        pathname.startsWith('/payments') ||
        pathname.startsWith('/subscriptions') ||
        pathname.startsWith('/admin');

      if (isProtectedRoute && pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
