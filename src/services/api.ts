import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';
import type { 
  Student, 
  Order, 
  OrderUpdate,
  DashboardStats,
  OrderStatistics,
  AuthResponse, 
  ApiResponse,
  LoginCredentials,
  User
} from '@/types';
import { config } from '@/config';

const API_BASE_URL = config.api.baseURL;

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: config.api.timeout,
    });

    // Request interceptor - Add auth token to requests
    this.api.interceptors.request.use(
      (config) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('washermanToken') : null;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle 401 Unauthorized
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Unauthorized - clear auth and redirect to login
          if (typeof window !== 'undefined') {
            localStorage.removeItem('washermanToken');
            localStorage.removeItem('washermanUser');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await this.api.post<AuthResponse>('/auth/washerman/login', credentials);
      console.log('Washerman login response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Washerman login error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    // Clear local storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('washermanToken');
      localStorage.removeItem('washermanUser');
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('washermanUser') : null;
      if (!userStr) return null;
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await this.api.get<ApiResponse<DashboardStats>>('/washerman/dashboard');
      console.log('Dashboard stats response:', response.data);
      return response.data.data || {
        totalOrders: 0,
        pendingOrders: 0,
        inprogressOrders: 0,
        completeOrders: 0,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return zeros if API fails
      return {
        totalOrders: 0,
        pendingOrders: 0,
        inprogressOrders: 0,
        completeOrders: 0,
      };
    }
  }

  // Orders
  async getAllOrders(): Promise<Order[]> {
    try {
      const response = await this.api.get<ApiResponse<Order[]>>('/orders/all');
      console.log('getAllOrders response:', response.data);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  }

  async getPendingOrders(): Promise<Order[]> {
    try {
      const response = await this.api.get<ApiResponse<Order[]>>('/orders/pending');
      console.log('getPendingOrders response:', response.data);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching pending orders:', error);
      return [];
    }
  }

  async getInProgressOrders(): Promise<Order[]> {
    try {
      const orders = await this.getAllOrders();
      return orders.filter(order => order.status === 'INPROGRESS');
    } catch (error) {
      console.error('Error fetching in-progress orders:', error);
      return [];
    }
  }

  async getCompletedOrders(): Promise<Order[]> {
    try {
      const orders = await this.getAllOrders();
      return orders.filter(order => order.status === 'COMPLETE');
    } catch (error) {
      console.error('Error fetching completed orders:', error);
      return [];
    }
  }

  async getOrderById(id: number): Promise<Order | null> {
    try {
      const response = await this.api.get<ApiResponse<Order>>(`/orders/${id}`);
      return response.data.data || null;
    } catch (error) {
      console.error(`Error fetching order ${id}:`, error);
      return null;
    }
  }

  async updateOrderStatus(id: number, status: string): Promise<ApiResponse<Order>> {
    try {
      // Backend expects lowercase status values
      const response = await this.api.put<ApiResponse<Order>>(`/orders/${id}/status`, { 
        status: status.toLowerCase() 
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating order ${id} status:`, error);
      throw error;
    }
  }

  async updateOrder(id: number, updates: OrderUpdate): Promise<ApiResponse<Order>> {
    try {
      const response = await this.api.put<ApiResponse<Order>>(`/orders/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error(`Error updating order ${id}:`, error);
      throw error;
    }
  }

  // Students
  async getStudentByBagNo(bagNo: string): Promise<Student | null> {
    try {
      const response = await this.api.get<ApiResponse<Student>>(`/admin/students/${bagNo}`);
      return response.data.data || null;
    } catch (error) {
      console.error(`Error fetching student ${bagNo}:`, error);
      return null;
    }
  }

  async getStudentOrders(bagNo: string): Promise<Order[]> {
    try {
      const response = await this.api.get<ApiResponse<Order[]>>(`/orders/student/${bagNo}`);
      return response.data.data || [];
    } catch (error) {
      console.error(`Error fetching orders for student ${bagNo}:`, error);
      return [];
    }
  }

  // Statistics (future implementation)
  async getOrderStatistics(startDate?: string, endDate?: string): Promise<OrderStatistics> {
    try {
      // This endpoint may need to be created in the backend
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await this.api.get<ApiResponse<OrderStatistics>>(
        `/washerman/statistics?${params.toString()}`
      );
      return response.data.data || {
        daily: [],
        statusDistribution: [],
      };
    } catch (error) {
      console.error('Error fetching statistics:', error);
      // Return default empty statistics
      return {
        daily: [],
        statusDistribution: [],
      };
    }
  }

  // Profile / Settings
  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
    try {
      const response = await this.api.put<ApiResponse>('/washerman/password', {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }
}

export const api = new ApiService();
export default api;
