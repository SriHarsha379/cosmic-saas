import api from '@/lib/api';
import type { Interview } from '@/types';

export const interviewService = {
  getAll: async (): Promise<Interview[]> => {
    const res = await api.get('/interviews');
    return res.data.data;
  },

  getById: async (id: string): Promise<Interview> => {
    const res = await api.get(`/interviews/${id}`);
    return res.data.data;
  },

  schedule: async (data: { type: string; scheduledAt: string; duration: number }): Promise<Interview> => {
    const res = await api.post('/interviews', data);
    return res.data.data;
  },

  cancel: async (id: string): Promise<void> => {
    await api.patch(`/interviews/${id}/cancel`);
  },

  submitFeedback: async (id: string, feedback: string, score: number): Promise<Interview> => {
    const res = await api.patch(`/interviews/${id}/feedback`, { feedback, score });
    return res.data.data;
  },
};
