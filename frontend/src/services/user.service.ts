import api from '@/lib/api';

export const userService = {
  getProfile: async (): Promise<any> => {
    try {
      const res = await api.get('/users/profile');
      return res.data.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  },

  updateProfile: async (data: any): Promise<any> => {
    const res = await api.put('/users/profile', data);
    return res.data.data;
  },

  listUsers: async (params?: any): Promise<any[]> => {
    try {
      const res = await api.get('/users', { params });
      return Array.isArray(res.data.data) ? res.data.data : [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  getUserById: async (id: string): Promise<any> => {
    const res = await api.get(`/users/${id}`);
    return res.data.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};
