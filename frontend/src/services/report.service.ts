import api from '@/lib/api';

export const reportService = {
  getPerformance: async () => {
    const res = await api.get('/reports/performance');
    return res.data.data;
  },

  getTestHistory: async () => {
    const res = await api.get('/reports/test-history');
    return res.data.data;
  },

  getSkillAnalysis: async () => {
    const res = await api.get('/reports/skills');
    return res.data.data;
  },

  getOverview: async () => {
    const res = await api.get('/reports/overview');
    return res.data.data;
  },
};
