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

interface Tokens {
  access: string;
  refresh: string;
}

interface LoginResponse {
  message?: string;
  user: User;
  tokens: Tokens;
}

interface RegisterResponse {
  message: string;
  user: User;
  tokens: Tokens;
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

// SecureStore helper functions
const setItemAsync = async (key: string, value: string) => {
  await SecureStore.setItemAsync(key, value);
};

const getItemAsync = async (key: string): Promise<string | null> => {
  return await SecureStore.getItemAsync(key);
};

const deleteItemAsync = async (key: string) => {
  await SecureStore.deleteItemAsync(key);
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const accessToken = await getItemAsync('accessToken');
      const userData = await getItemAsync('user');
      
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
      
      console.log('Making login request to:', `${BASE_URL}/users/login/`);
      
      const response = await fetch(`${BASE_URL}/users/login/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || data.message || 'Login failed');
      }

      // Store tokens and user data using correct SecureStore API
      await setItemAsync('accessToken', data.tokens.access);
      await setItemAsync('refreshToken', data.tokens.refresh);
      await setItemAsync('user', JSON.stringify(data.user));

      setUser(data.user);
      console.log('Login successful for user:', data.user.username);
      return true;
    } catch (error: any) {
      console.error('Login error:', error.message);
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      console.log('Making register request to:', `${BASE_URL}/users/register/`);
      
      const response = await fetch(`${BASE_URL}/users/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || data.message || 'Registration failed');
      }

      // Store tokens and user data using correct SecureStore API
      await setItemAsync('accessToken', data.tokens.access);
      await setItemAsync('refreshToken', data.tokens.refresh);
      await setItemAsync('user', JSON.stringify(data.user));

      setUser(data.user);
      console.log('Registration successful for user:', data.user.username);
      return true;
    } catch (error: any) {
      console.error('Registration error:', error.message);
      return false;
    }
  };

  const logout = async () => {
    await deleteItemAsync('accessToken');
    await deleteItemAsync('refreshToken');
    await deleteItemAsync('user');
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