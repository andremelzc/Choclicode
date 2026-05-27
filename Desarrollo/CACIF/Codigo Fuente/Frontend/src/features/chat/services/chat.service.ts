import type { Message, Conversation } from "../../../types/chat";
import { api } from "../../../services/api";

export const chatService = {
  getConversations: async (_studentId: string): Promise<Conversation[]> => {
    try {
      const response = await api.get('/chat/conversations');
      return response.data;
    } catch (error) {
      console.error("Error al obtener conversaciones:", error);
      return [];
    }
  },

  createConversation: async (intentType: string = "CU00"): Promise<Conversation> => {
    try {
      const response = await api.post('/chat/conversations', { intent_type: intentType });
      return response.data;
    } catch (error) {
      console.error("Error al crear conversación:", error);
      throw error;
    }
  },

  getMessages: async (conversationId: string): Promise<Message[]> => {
    try {
      const response = await api.get(`/chat/conversations/${conversationId}/messages`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener mensajes:", error);
      return [];
    }
  },

  sendMessage: async (content: string, conversationId: string): Promise<Message> => {
    try {
      const response = await api.post('/chat/message', {
        conversation_id: conversationId,
        content: content
      });
      return response.data;
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      throw error;
    }
  }
};
