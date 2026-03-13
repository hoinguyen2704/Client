import axios from 'axios';
import type { ApiResponse } from '@/types';

const chatbotAxios = axios.create({
  baseURL: import.meta.env.VITE_CHATBOT_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

export interface ChatbotMessage {
  role: 'user' | 'assistant';
  content: string;
}

const chatbotService = {
  sendMessage: (message: string, history: ChatbotMessage[] = []): Promise<ApiResponse<string>> =>
    chatbotAxios.post('', { message, history }).then((r) => r.data),
};

export default chatbotService;
