import api from '@/lib/api';

export const testService = {
  getAll: async (params?: any): Promise<any[]> => {
    try {
      const res = await api.get('/tests', { params });
      return Array.isArray(res.data.data) ? res.data.data : [];
    } catch (error) {
      console.error('Error fetching tests:', error);
      return [];
    }
  },

  getById: async (id: string): Promise<any> => {
    const res = await api.get(`/tests/${id}`);
    return res.data.data;
  },

  startTest: async (id: string): Promise<any> => {
    const res = await api.post(`/tests/${id}/start`, {});
    return res.data.data;
  },

  submitTest: async (id: string, answers: any): Promise<any> => {
    const res = await api.post(`/tests/${id}/submit`, { answers });
    return res.data.data;
  },

  getResults: async (): Promise<any[]> => {
    try {
      const res = await api.get('/results');
      return Array.isArray(res.data.data) ? res.data.data : [];
    } catch (error) {
      console.error('Error fetching results:', error);
      return [];
    }
  },

  getResultById: async (id: string): Promise<any> => {
    const res = await api.get(`/results/${id}`);
    return res.data.data;
  },
};
