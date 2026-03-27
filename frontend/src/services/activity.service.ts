import api from '@/lib/api';
import type { Activity } from '@/types';

export const activityService = {
  getAll: async (limit = 20): Promise<Activity[]> => {
    try {
      const res = await api.get('/activities', { params: { limit } });
      // Backend returns { success, data: { activities, total, page, totalPages } }
      const data = res.data.data;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.activities)) return data.activities;
      return [];
    } catch {
      return [];
    }
  },

  getRecent: async (): Promise<Activity[]> => {
    try {
      const res = await api.get('/activities/recent');
      const data = res.data.data;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.activities)) return data.activities;
      return [];
    } catch {
      return [];
    }
  },
};
