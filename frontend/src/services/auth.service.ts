import api from '@/lib/api';
import type { User } from '@/types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const res = await api.post('/auth/login', payload);
    return res.data;
  },

  signup: async (payload: SignupPayload): Promise<AuthResponse> => {
    const res = await api.post('/auth/signup', payload);
    return res.data;
  },

  getMe: async (): Promise<User> => {
    const res = await api.get('/auth/me');
    return res.data.data;
  },

  changePassword: async (payload: { currentPassword: string; newPassword: string }) => {
    const res = await api.put('/auth/change-password', payload);
    return res.data;
  },
};
