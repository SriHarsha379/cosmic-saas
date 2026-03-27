import api from '@/lib/api';
import type { TestResult } from '@/types';

export const resultService = {
  getAll: async (): Promise<TestResult[]> => {
    try {
      const res = await api.get('/results');
      return Array.isArray(res.data.data) ? res.data.data : [];
    } catch {
      return [];
    }
  },

  getById: async (id: string): Promise<TestResult> => {
    try {
      const res = await api.get(`/results/${id}`);
      return res.data.data;
    } catch (error) {
      throw new Error(`Failed to fetch result: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};
