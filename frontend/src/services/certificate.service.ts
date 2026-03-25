import api from '@/lib/api';
import type { Certificate } from '@/types';

export const certificateService = {
  getAll: async (): Promise<Certificate[]> => {
    const res = await api.get('/certificates');
    return res.data.data;
  },

  getById: async (id: string): Promise<Certificate> => {
    const res = await api.get(`/certificates/${id}`);
    return res.data.data;
  },

  verify: async (code: string): Promise<Certificate> => {
    const res = await api.get(`/certificates/verify/${code}`);
    return res.data.data;
  },

  download: async (id: string): Promise<Blob> => {
    const res = await api.get(`/certificates/${id}/download`, { responseType: 'blob' });
    return res.data;
  },
};
