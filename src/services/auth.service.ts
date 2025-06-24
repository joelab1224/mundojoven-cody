import apiClient from '@/lib/api-client';
import { LoginRequest, LoginResponse } from '@/types/api';

export class AuthService {
  /**
   * Login to the MundoJoven API
   */
  static async login(credentials?: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.login(credentials);
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error('Authentication failed');
    }
  }

  /**
   * Logout and clear authentication
   */
  static logout(): void {
    apiClient.clearAuthentication();
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  }

  /**
   * Get current authentication status
   */
  static getAuthStatus(): { isAuthenticated: boolean } {
    return {
      isAuthenticated: apiClient.isAuthenticated(),
    };
  }
}

export default AuthService;
