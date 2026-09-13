import { User, LoginCredentials } from '../types/auth.types';
import { apiClient } from './apiClient';
import { getStoredItem, setStoredItem } from '../utils/storageUtils';

const USER_STORAGE_KEY = 'auth_user';

export const authService = {
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      const { accessToken, user } = response.data;

      // Store token and user
      apiClient.setToken(accessToken);
      setStoredItem(USER_STORAGE_KEY, user);

      return user;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Login failed');
    }
  },

  logout(): void {
    apiClient.logout();
    setStoredItem(USER_STORAGE_KEY, null);
  },

  getCurrentUser(): User | null {
    return getStoredItem<User>(USER_STORAGE_KEY, null);
  },

  getToken(): string | null {
    return apiClient.getToken();
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
