// Authentication context and utilities

import { create } from 'zustand';
import { User } from '@/types/api';
import api from '@/services/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  isStudent: boolean;
  login: (email: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (user: User) => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isAdmin: false,
  isStudent: false,

  login: async (email: string) => {
    try {
      const response = await api.login({ email });
      if (response.ok && response.data) {
        const { user } = response.data;
        set({
          user,
          isAuthenticated: true,
          isAdmin: user.is_admin,
          isStudent: user.is_student,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  },

  logout: async () => {
    await api.logout();
    set({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      isStudent: false,
    });
  },

  checkAuth: async () => {
    set({ isLoading: true });
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        const response = await api.getCurrentUser();
        if (response.ok && response.data) {
          set({
            user: response.data,
            isAuthenticated: true,
            isAdmin: response.data.is_admin,
            isStudent: response.data.is_student,
          });
        } else {
          // Clear invalid session
          localStorage.removeItem('user');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      } catch (error) {
        console.error('Auth check error:', error);
      }
    }
    set({ isLoading: false });
  },

  updateUser: (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({
      user,
      isAdmin: user.is_admin,
      isStudent: user.is_student,
    });
  },
}));