import api from '@/lib/api';
import type { LeaderboardEntry } from '@/types';

export const leaderboardService = {
  getGlobal: async (page = 1, limit = 50): Promise<LeaderboardEntry[]> => {
    const res = await api.get('/leaderboard', { params: { page, limit } });
    return res.data.data;
  },

  getMyRank: async (): Promise<{ rank: number; score: number }> => {
    const res = await api.get('/leaderboard/me');
    return res.data.data;
  },

  getByCategory: async (category: string): Promise<LeaderboardEntry[]> => {
    const res = await api.get(`/leaderboard/${category}`);
    return res.data.data;
  },
};
