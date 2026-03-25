import api from '@/lib/api';
import type { ChatMessage } from '@/types';

export const chatService = {
  getHistory: async (userId: string): Promise<ChatMessage[]> => {
    const res = await api.get(`/chat/history/${userId}`);
    return res.data.data;
  },

  sendMessage: async (data: { receiver: string; content: string; type?: string }): Promise<ChatMessage> => {
    const res = await api.post('/chat/send', data);
    return res.data.data;
  },

  getRooms: async () => {
    const res = await api.get('/chat/rooms');
    return res.data.data;
  },
};
