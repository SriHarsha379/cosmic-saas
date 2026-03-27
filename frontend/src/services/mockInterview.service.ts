import api from '@/lib/api';

export const mockInterviewService = {
  getInterviewTypes: async (): Promise<any> => {
    try {
      const res = await api.get('/mock-interviews');
      return res.data.data;
    } catch { return { jobRoles: [], interviews: [] }; }
  },
  getMyInterviews: async (): Promise<any[]> => {
    try {
      const res = await api.get('/mock-interviews/my');
      return Array.isArray(res.data.data) ? res.data.data : [];
    } catch { return []; }
  },
  startInterview: async (data: { jobRole: string; difficulty?: string }): Promise<any> => {
    const res = await api.post('/mock-interviews', data);
    return res.data.data;
  },
  submitInterview: async (id: string, answers: any[]): Promise<any> => {
    const res = await api.post(`/mock-interviews/${id}/submit`, { answers });
    return res.data.data;
  },
  getResults: async (id: string): Promise<any> => {
    const res = await api.get(`/mock-interviews/${id}/results`);
    return res.data.data;
  },
};
