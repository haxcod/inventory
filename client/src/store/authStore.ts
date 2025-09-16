import type { User } from '../types';

// Auth store using Zustand for state management
interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

// Simple in-memory store (you can replace with Zustand if needed)
export const authStore: AuthStore = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: (user: User) => {
    authStore.user = user;
    authStore.isAuthenticated = true;
    authStore.isLoading = false;
    // Store user data in localStorage for quick access
    localStorage.setItem('user', JSON.stringify(user));
  },
  logout: () => {
    authStore.user = null;
    authStore.isAuthenticated = false;
    authStore.isLoading = false;
    // Clear user data from localStorage
    localStorage.removeItem('user');
  },
  setLoading: (loading: boolean) => {
    authStore.isLoading = loading;
  }
};
