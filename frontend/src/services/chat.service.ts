import api from '@/lib/api';

export const chatService = {
  // Team Chat Methods
  sendTeamMessage: async (teamId: string, message: string): Promise<any> => {
    try {
      const res = await api.post(`/team-chat/${teamId}/message`, {
        teamId,
        message,
      });
      console.log('✅ sendTeamMessage response:', res.data);
      return res.data.data;
    } catch (error) {
      console.error('❌ sendTeamMessage error:', error);
      throw error;
    }
  },

  getTeamChat: async (teamId: string): Promise<any[]> => {
    try {
      const res = await api.get(`/team-chat/${teamId}/messages`);
      console.log('📨 getTeamChat response:', res.data.data);
      return Array.isArray(res.data.data) ? res.data.data : [];
    } catch (error) {
      console.error('❌ getTeamChat error:', error);
      return [];
    }
  },

  deleteTeamMessage: async (messageId: string): Promise<void> => {
    try {
      await api.delete(`/team-chat/message/${messageId}`);
    } catch (error) {
      console.error('❌ deleteTeamMessage error:', error);
      throw error;
    }
  },

  // Old Bot Chat Methods (keep for backwards compatibility)
  sendMessage: async (data: any): Promise<any> => {
    try {
      const res = await api.post('/chat/message', data);
      return res.data.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  getChatHistory: async (): Promise<any[]> => {
    try {
      const res = await api.get('/chat/history');
      return Array.isArray(res.data.data) ? res.data.data : [];
    } catch (error) {
      console.error('Error fetching chat history:', error);
      return [];
    }
  },

  getConversation: async (conversationId: string): Promise<any> => {
    try {
      const res = await api.get(`/chat/conversation/${conversationId}`);
      return res.data.data;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      throw error;
    }
  },

  deleteConversation: async (conversationId: string): Promise<void> => {
    try {
      await api.delete(`/chat/conversation/${conversationId}`);
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  },
};
