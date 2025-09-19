/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useEffect, useState, useContext } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { apiService } from '../lib/api';
import { useCookies } from 'react-cookie';
import { authStore } from '../store/authStore';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [cookies, setCookie, removeCookie] = useCookies(['auth-token']);
  const [user, setUser] = useState<import('../types').User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  // Extract token from cookies to avoid complex expression in dependency array
  const authToken = cookies['auth-token'];

  // Cookie-aware login function
  const loginWithCookie = useCallback((user: User, token: string) => {
    // Update local state
    setUser(user);
    setIsAuthenticated(true);
    setIsLoading(false);
    
    // Also update authStore for consistency
    authStore.login(user);
    
    // Store token in cookie for automatic HTTP requests
    setCookie('auth-token', token, { 
      path: '/', 
      maxAge: 7 * 24 * 60 * 60, // 7 days
      secure: import.meta.env.PROD,
      sameSite: 'strict'
    });
  }, [setCookie]);

  // Cookie-aware logout function
  const logoutWithCookie = useCallback(() => {
    // Update local state
    setUser(null);
    setIsAuthenticated(false);
    setIsLoading(false);
    
    // Also update authStore for consistency
    authStore.logout();
    
    // Clear token cookie
    removeCookie('auth-token');
  }, [removeCookie]);

  useEffect(() => {
    // Only run auth check once
    if (hasCheckedAuth) return;
    
    // Check for existing auth on mount
    const checkAuth = async () => {
      const token = authToken;
      
      if (token) {
        try {
          // Verify token with backend using apiService
          const response = await apiService.auth.me();
          
          if (response.data.success && response.data.data.user) {
            loginWithCookie(response.data.data.user, token);
          } else {
            logoutWithCookie();
          }
        } catch {
          logoutWithCookie();
        }
      } else {
        setIsLoading(false);
      }
      
      setHasCheckedAuth(true);
    };

    checkAuth();
  }, [authToken, hasCheckedAuth, loginWithCookie, logoutWithCookie]);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login: loginWithCookie,
    logout: logoutWithCookie,
  };


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Export the hook from the same file
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

