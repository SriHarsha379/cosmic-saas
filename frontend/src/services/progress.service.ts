import api from '@/lib/api';

export const progressService = {
  getStats: async (): Promise<any> => {
    try {
      const res = await api.get('/progress/stats');
      return res.data.data;
    } catch { return {}; }
  },
  getHistory: async (): Promise<any[]> => {
    try {
      const res = await api.get('/progress/history');
      return Array.isArray(res.data.data) ? res.data.data : [];
    } catch { return []; }
  },
  getMetrics: async (): Promise<any[]> => {
    try {
      const res = await api.get('/progress/metrics');
      return Array.isArray(res.data.data) ? res.data.data : [];
    } catch { return []; }
  },
};
