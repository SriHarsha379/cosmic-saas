import api from '@/lib/api';

export const selfEvaluationService = {
  getModes: async (): Promise<any[]> => {
    try {
      const res = await api.get('/self-evaluations/modes');
      return Array.isArray(res.data.data) ? res.data.data : [];
    } catch { return []; }
  },
  getEvaluations: async (): Promise<any[]> => {
    try {
      const res = await api.get('/self-evaluations');
      return Array.isArray(res.data.data) ? res.data.data : [];
    } catch { return []; }
  },
  createEvaluation: async (data: { jobRole: string; mode: string }): Promise<any> => {
    const res = await api.post('/self-evaluations', data);
    return res.data.data;
  },
  submitEvaluation: async (id: string, answers: any[]): Promise<any> => {
    const res = await api.post(`/self-evaluations/${id}/submit`, { answers });
    return res.data.data;
  },
  getResults: async (id: string): Promise<any> => {
    const res = await api.get(`/self-evaluations/${id}/results`);
    return res.data.data;
  },
};
