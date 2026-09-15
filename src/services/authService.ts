import { apiClient } from './apiClient';
import { AuthResponse, LoginCredentials, User } from '../types/auth.types';
import { getStoredItem, setStoredItem, removeStoredItem } from '../utils/storageUtils';

const STORAGE_USER_KEY = 'gym_current_user';
const STORAGE_TOKEN_KEY = 'gym_jwt_token';

export const authService = {
  /**
   * Authenticate user with backend FastAPI endpoint: POST /fitness/auth/login
   */
  async login(credentials: LoginCredentials): Promise<User> {
    const payload = {
      email: credentials.email.toLowerCase().trim(),
      pass: credentials.pass || credentials.password,
    };

    const response = await apiClient.post<AuthResponse>('/fitness/auth/login', payload);
    const { accessToken, user } = response.data;

    // Persist session tokens and user data
    setStoredItem(STORAGE_TOKEN_KEY, accessToken);
    setStoredItem(STORAGE_USER_KEY, user);

    return user;
  },

  /**
   * Read locally cached user
   */
  getCurrentUser(): User | null {
    return getStoredItem<User | null>(STORAGE_USER_KEY, null);
  },

  /**
   * Read stored JWT Token
   */
  getToken(): string | null {
    return getStoredItem<string | null>(STORAGE_TOKEN_KEY, null);
  },

  /**
   * Fetch latest profile from backend: GET /fitness/auth/me
   */
  async fetchMe(): Promise<User | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const response = await apiClient.get<User>('/fitness/auth/me');
      const user = response.data;
      setStoredItem(STORAGE_USER_KEY, user);
      return user;
    } catch {
      this.logout();
      return null;
    }
  },

  /**
   * Clear session
   */
  logout(): void {
    removeStoredItem(STORAGE_USER_KEY);
    removeStoredItem(STORAGE_TOKEN_KEY);
  },
};

