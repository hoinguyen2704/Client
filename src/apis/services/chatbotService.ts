import axios from 'axios';

const chatbotAxios = axios.create({
  baseURL: import.meta.env.VITE_CHATBOT_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

/** Role phải là 'bot' (không phải 'assistant') để chatbot server map đúng sang OpenAI */
export interface ChatbotMessage {
  role: 'user' | 'bot';
  content: string;
}

/** Response thực tế từ chatbot server */
export interface ChatbotResponse {
  answer: string;
  mode: 'db' | 'non_db' | 'recommend';
  data?: unknown;
  plan?: unknown;
  sql?: string;
  params?: unknown[];
  rowCount?: number;
  rows?: unknown[];
}

const chatbotService = {
  sendMessage: (message: string, history: ChatbotMessage[] = []): Promise<ChatbotResponse> =>
    chatbotAxios.post('', { prompt: message, history }).then((r) => r.data),
};

export default chatbotService;
