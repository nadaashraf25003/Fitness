import axios, { AxiosInstance } from 'axios';
import { getStoredItem, setStoredItem } from '../utils/storageUtils';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/fitness';

class APIClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.token = getStoredItem<string>('auth_token', null);

    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests if available
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Handle 401 errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.logout();
        }
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string) {
    this.token = token;
    setStoredItem('auth_token', token);
  }

  getToken(): string | null {
    return this.token;
  }

  logout() {
    this.token = null;
    setStoredItem('auth_token', null);
  }

  get(url: string, config?: any) {
    return this.client.get(url, config);
  }

  post(url: string, data?: any, config?: any) {
    return this.client.post(url, data, config);
  }

  put(url: string, data?: any, config?: any) {
    return this.client.put(url, data, config);
  }

  delete(url: string, config?: any) {
    return this.client.delete(url, config);
  }

  patch(url: string, data?: any, config?: any) {
    return this.client.patch(url, data, config);
  }
}

export const apiClient = new APIClient();
