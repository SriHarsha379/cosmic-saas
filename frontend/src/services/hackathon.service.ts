import api from '@/lib/api';
import type { Hackathon } from '@/types';

export const hackathonService = {
  getAll: async (status?: string): Promise<Hackathon[]> => {
    const params = status ? { status } : {};
    const res = await api.get('/hackathons', { params });
    return res.data.data;
  },

  getById: async (id: string): Promise<Hackathon> => {
    const res = await api.get(`/hackathons/${id}`);
    return res.data.data;
  },

  join: async (id: string): Promise<void> => {
    await api.post(`/hackathons/${id}/join`);
  },

  leave: async (id: string): Promise<void> => {
    await api.post(`/hackathons/${id}/leave`);
  },

  create: async (data: Partial<Hackathon>): Promise<Hackathon> => {
    const res = await api.post('/hackathons', data);
    return res.data.data;
  },
};
