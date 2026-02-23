// Authentication Types
export interface User {
  id: number;
  username: string;
  role: 'washerman';
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    username?: string;
    id?: number;
  };
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// API Types
export interface Student {
  bagNo: string;
  name: string;
  email: string;
  enrollmentNo: string;
  phoneNo: string;
  residencyNo: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 'PENDING' | 'INPROGRESS' | 'COMPLETE';

export interface Order {
  id: number;
  bagNo: string;
  studentName?: string;
  numberOfClothes: number;
  noOfClothes?: number; // Alias for backward compatibility
  status: OrderStatus;
  submissionDate?: string;
  notes?: string; // For washerman comments
  createdAt: string;
  updatedAt: string;
}

export interface OrderUpdate {
  status?: OrderStatus;
  notes?: string;
}

// Dashboard Stats for Washerman
export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  inprogressOrders: number;  // Backend returns lowercase
  completeOrders: number;     // Backend returns 'complete' not 'completed'
  todayOrders?: number;
  recentOrders?: Order[];
}

// Statistics for Charts
export interface OrderStatistics {
  daily: {
    date: string;
    count: number;
  }[];
  statusDistribution: {
    status: OrderStatus;
    count: number;
    percentage: number;
  }[];
  averageCompletionTime?: number; // in hours
  averageOrdersPerDay?: number;
}

// Generic API Response
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}
