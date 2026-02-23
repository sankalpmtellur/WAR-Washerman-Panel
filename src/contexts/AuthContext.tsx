'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { LoginCredentials, User } from '@/types';
import { api } from '@/services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('washermanUser');
    const token = localStorage.getItem('washermanToken');
    
    if (storedUser && token) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        console.log('Restored washerman session:', userData);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('washermanUser');
        localStorage.removeItem('washermanToken');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      console.log('AuthContext: Attempting washerman login');
      const response = await api.login(credentials);
      console.log('AuthContext: Login response:', response);
      
      if (response.success && response.data) {
        const userData: User = {
          id: response.data.id || 0,
          username: response.data.username || credentials.username,
          role: 'washerman',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        console.log('AuthContext: Setting user data:', userData);
        setUser(userData);
        localStorage.setItem('washermanUser', JSON.stringify(userData));
        // Store a session token (until we implement JWT in backend)
        localStorage.setItem('washermanToken', 'washerman-session-' + Date.now());
        console.log('AuthContext: Login successful');
      } else {
        console.error('AuthContext: Login failed -', response.message);
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('AuthContext: Login error:', error);
      // Provide user-friendly error message
      if (error.response?.status === 401) {
        throw new Error('Invalid username or password');
      } else if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.message) {
        throw error;
      } else {
        throw new Error('Failed to connect to server');
      }
    }
  };

  const logout = () => {
    console.log('AuthContext: Logging out washerman');
    setUser(null);
    localStorage.removeItem('washermanUser');
    localStorage.removeItem('washermanToken');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
