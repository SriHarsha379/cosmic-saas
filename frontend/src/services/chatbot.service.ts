import api from '@/lib/api';

export const chatbotService = {
  listChats: async (): Promise<any[]> => {
    try {
      const res = await api.get('/chatbot');
      return Array.isArray(res.data.data) ? res.data.data : [];
    } catch { return []; }
  },
  createChat: async (data: { type: string; title?: string }): Promise<any> => {
    const res = await api.post('/chatbot', data);
    return res.data.data;
  },
  getChat: async (id: string): Promise<any> => {
    const res = await api.get(`/chatbot/${id}`);
    return res.data.data;
  },
  sendMessage: async (id: string, content: string): Promise<any> => {
    const res = await api.post(`/chatbot/${id}/message`, { content });
    return res.data.data;
  },
};
