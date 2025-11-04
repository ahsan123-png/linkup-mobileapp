import { BASE_URL } from '@/utils/constants';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';



interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  profile_image?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
}

interface RegisterData {
  full_name: string;
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      const userData = await SecureStore.getItemAsync('user');
      
      if (accessToken && userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const payload = { 
        username_or_email_or_phone: username, 
        password 
      };
      
      const response = await fetch(`${BASE_URL}/users/login/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();

      // Store tokens and user data
      await SecureStore.setItemAsync('accessToken', data.tokens.access);
      await SecureStore.setItemAsync('refreshToken', data.tokens.refresh);
      await SecureStore.setItemAsync('user', JSON.stringify(data.user));

      setUser(data.user);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      const response = await fetch(`${BASE_URL}/users/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      const data = await response.json();

      // Auto-login after registration
      await SecureStore.setItemAsync('accessToken', data.tokens.access);
      await SecureStore.setItemAsync('refreshToken', data.tokens.refresh);
      await SecureStore.setItemAsync('user', JSON.stringify(data.user));

      setUser(data.user);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    await SecureStore.deleteItemAsync('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};