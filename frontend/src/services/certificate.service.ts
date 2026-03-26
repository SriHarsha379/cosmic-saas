import api from '@/lib/api';

export const certificateService = {
  getAll: async (): Promise<any[]> => {
    try {
      const res = await api.get('/certificates');
      return Array.isArray(res.data.data) ? res.data.data : [];
    } catch (error) {
      console.error('Error fetching certificates:', error);
      return [];
    }
  },

  getById: async (id: string): Promise<any> => {
    const res = await api.get(`/certificates/${id}`);
    return res.data.data;
  },

  getUserCertificates: async (userId: string): Promise<any[]> => {
    try {
      const res = await api.get(`/certificates/user/${userId}`);
      return Array.isArray(res.data.data) ? res.data.data : [];
    } catch (error) {
      console.error('Error fetching user certificates:', error);
      return [];
    }
  },

  issue: async (data: any): Promise<any> => {
    const res = await api.post('/certificates', data);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/certificates/${id}`);
  },
};
