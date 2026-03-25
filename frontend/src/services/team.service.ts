import api from '@/lib/api';
import type { Team } from '@/types';

export const teamService = {
  getAll: async (): Promise<Team[]> => {
    const res = await api.get('/teams');
    return res.data.data;
  },

  getById: async (id: string): Promise<Team> => {
    const res = await api.get(`/teams/${id}`);
    return res.data.data;
  },

  create: async (data: { name: string; description?: string; hackathon: string; maxSize: number }): Promise<Team> => {
    const res = await api.post('/teams', data);
    return res.data.data;
  },

  join: async (inviteCode: string): Promise<Team> => {
    const res = await api.post('/teams/join', { inviteCode });
    return res.data.data;
  },

  leave: async (id: string): Promise<void> => {
    await api.post(`/teams/${id}/leave`);
  },

  removeMember: async (teamId: string, userId: string): Promise<void> => {
    await api.delete(`/teams/${teamId}/members/${userId}`);
  },
};
