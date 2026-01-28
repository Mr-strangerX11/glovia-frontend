import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { authAPI } from '@/lib/api';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        try {
          set({ isLoading: true });
          const response = await authAPI.login({ email, password });
          const { user, accessToken, refreshToken } = response.data;

          Cookies.set('access_token', accessToken);
          Cookies.set('refresh_token', refreshToken);
          Cookies.set('user_id', user.id);

          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data) => {
        try {
          set({ isLoading: true });
          const response = await authAPI.register(data);
          const { user, accessToken, refreshToken } = response.data;

          Cookies.set('access_token', accessToken);
          Cookies.set('refresh_token', refreshToken);
          Cookies.set('user_id', user.id);

          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authAPI.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          Cookies.remove('access_token');
          Cookies.remove('refresh_token');
          Cookies.remove('user_id');
          set({ user: null, isAuthenticated: false });
        }
      },

      hydrate: async () => {
        const hasToken = !!Cookies.get('access_token');
        if (!hasToken) {
          set({ user: null, isAuthenticated: false });
          return;
        }

        try {
          set({ isLoading: true });
          const { data } = await authAPI.getProfile();
          set({ user: data, isAuthenticated: true, isLoading: false });
        } catch (error) {
          Cookies.remove('access_token');
          Cookies.remove('refresh_token');
          Cookies.remove('user_id');
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
