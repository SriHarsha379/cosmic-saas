import api from '@/lib/api';
import type { Hackathon } from '@/types';

export const hackathonService = {
  getAll: async (status?: string): Promise<Hackathon[]> => {
    try {
      const params = status ? { status } : {};
      const res = await api.get('/hackathons', { params });
      const hackathons = res.data.data?.hackathons || res.data.data || [];
      return Array.isArray(hackathons) ? hackathons : [];
    } catch (error) {
      console.error('Error fetching hackathons:', error);
      return [];
    }
  },

  getById: async (id: string): Promise<Hackathon> => {
    const res = await api.get(`/hackathons/${id}`);
    return res.data.data;
  },

  join: async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await api.post(`/hackathons/${id}/join`, {});
      return { success: true, message: 'Successfully joined hackathon!' };
    } catch (error: any) {
      // Handle specific error codes
      const status = error.response?.status;
      const errorMessage = error.response?.data?.error;

      if (status === 409) {
        return { success: false, message: 'You have already joined this hackathon' };
      }
      if (status === 400) {
        return { success: false, message: errorMessage || 'Hackathon is full or unavailable' };
      }
      if (status === 404) {
        return { success: false, message: 'Hackathon not found' };
      }

      // For unexpected errors, still throw
      throw error;
    }
  },

  leave: async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await api.post(`/hackathons/${id}/leave`, {});
      return { success: true, message: 'Left hackathon successfully' };
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { success: false, message: 'You have not joined this hackathon' };
      }
      throw error;
    }
  },

  create: async (data: Partial<Hackathon>): Promise<Hackathon> => {
    const res = await api.post('/hackathons', data);
    return res.data.data;
  },

  update: async (id: string, data: Partial<Hackathon>): Promise<Hackathon> => {
    const res = await api.put(`/hackathons/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/hackathons/${id}`);
  },
};
