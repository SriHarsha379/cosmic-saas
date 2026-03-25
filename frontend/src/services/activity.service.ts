import api from '@/lib/api';
import type { Activity } from '@/types';

export const activityService = {
  getAll: async (limit = 20): Promise<Activity[]> => {
    const res = await api.get('/activities', { params: { limit } });
    return res.data.data;
  },

  getRecent: async (): Promise<Activity[]> => {
    const res = await api.get('/activities/recent');
    return res.data.data;
  },
};
