import api from '@/lib/api';
import type { Test, TestResult, AnswerEntry } from '@/types';

export const testService = {
  getAll: async (): Promise<Test[]> => {
    const res = await api.get('/tests');
    return res.data.data;
  },

  getById: async (id: string): Promise<Test> => {
    const res = await api.get(`/tests/${id}`);
    return res.data.data;
  },

  submit: async (testId: string, answers: AnswerEntry[], timeTaken: number): Promise<TestResult> => {
    const res = await api.post(`/tests/${testId}/submit`, { answers, timeTaken });
    return res.data.data;
  },

  getResults: async (): Promise<TestResult[]> => {
    const res = await api.get('/tests/results');
    return res.data.data;
  },

  getResultById: async (resultId: string): Promise<TestResult> => {
    const res = await api.get(`/tests/results/${resultId}`);
    return res.data.data;
  },
};
