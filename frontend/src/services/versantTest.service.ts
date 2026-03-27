import api from '@/lib/api';

export const versantTestService = {
  getTestTypes: async (): Promise<any[]> => {
    try {
      const res = await api.get('/versant-tests/types');
      return Array.isArray(res.data.data) ? res.data.data : [];
    } catch { return []; }
  },
  getMyTests: async (): Promise<any[]> => {
    try {
      const res = await api.get('/versant-tests/my');
      return Array.isArray(res.data.data) ? res.data.data : [];
    } catch { return []; }
  },
  startTest: async (data: { testType: string }): Promise<any> => {
    const res = await api.post('/versant-tests', data);
    return res.data.data;
  },
  submitTest: async (id: string, answers?: any[]): Promise<any> => {
    const res = await api.post(`/versant-tests/${id}/submit`, { answers });
    return res.data.data;
  },
  getResults: async (id: string): Promise<any> => {
    const res = await api.get(`/versant-tests/${id}/results`);
    return res.data.data;
  },
};
