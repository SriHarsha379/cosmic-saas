import api from '@/lib/api';
import type { Job, Application } from '@/types';

export const jobService = {
  getAll: async (params?: { skills?: string; location?: string; type?: string; experienceLevel?: string }): Promise<Job[]> => {
    const res = await api.get('/jobs', { params });
    return res.data.data;
  },

  getById: async (id: string): Promise<Job> => {
    const res = await api.get(`/jobs/${id}`);
    return res.data.data;
  },

  apply: async (jobId: string, data: { coverLetter?: string; resumeUrl?: string }): Promise<Application> => {
    const res = await api.post(`/jobs/${jobId}/apply`, data);
    return res.data.data;
  },

  getApplications: async (): Promise<Application[]> => {
    const res = await api.get('/applications');
    return res.data.data;
  },

  withdrawApplication: async (applicationId: string): Promise<void> => {
    await api.delete(`/applications/${applicationId}`);
  },
};
