import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { LoginRequest, LoginResponse } from '@/types/api';

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;
  private tokenPrefix: string = 'Bearer ';

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_MUNDOJOVEN_API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add authentication token
    this.client.interceptors.request.use(
      (config) => {
        if (this.token && config.headers) {
          config.headers.Authorization = `${this.tokenPrefix}${this.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.clearAuthentication();
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication methods
  async login(credentials?: LoginRequest): Promise<LoginResponse> {
    const loginData = credentials || {
      username: process.env.MUNDOJOVEN_API_USERNAME!,
      password: process.env.MUNDOJOVEN_API_PASSWORD!,
    };

    const response = await this.client.post<LoginResponse>('/login', loginData);
    
    if (response.data.TOKEN) {
      this.setAuthentication(response.data.TOKEN, response.data.TOKEN_PREFIX);
    }
    
    return response.data;
  }

  setAuthentication(token: string, tokenPrefix: string = 'Bearer ') {
    this.token = token;
    this.tokenPrefix = tokenPrefix;
    
    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('mundojoven_token', token);
      localStorage.setItem('mundojoven_token_prefix', tokenPrefix);
    }
  }

  clearAuthentication() {
    this.token = null;
    this.tokenPrefix = 'Bearer ';
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mundojoven_token');
      localStorage.removeItem('mundojoven_token_prefix');
    }
  }

  loadAuthenticationFromStorage() {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('mundojoven_token');
      const tokenPrefix = localStorage.getItem('mundojoven_token_prefix');
      
      if (token) {
        this.token = token;
        this.tokenPrefix = tokenPrefix || 'Bearer ';
      }
    }
  }

  async ensureAuthenticated(): Promise<void> {
    if (!this.token) {
      this.loadAuthenticationFromStorage();
      
      if (!this.token) {
        await this.login();
      }
    }
  }

  // Generic request method
  async request<T>(config: AxiosRequestConfig): Promise<T> {
    await this.ensureAuthenticated();
    const response = await this.client.request<T>(config);
    return response.data;
  }

  // HTTP methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

// Create singleton instance
export const apiClient = new ApiClient();
export default apiClient;
