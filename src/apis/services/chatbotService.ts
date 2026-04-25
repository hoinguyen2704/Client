import axios from "axios";
import useAuthStore from "@/stores/useAuthStore";
import type {
  ChatbotConfig,
  ChatbotConfigMutationResponse,
  ChatbotMessage,
  ChatbotResponse,
  WidgetConfig,
} from "@/types";

const CHATBOT_BASE = import.meta.env.VITE_CHATBOT_URL; // http://localhost:6969/api/v1/chatbot

/*  Axios cho chat (public — nhưng gửi token nếu có để cá nhân hóa gợi ý)  */
const chatbotAxios = axios.create({
  baseURL: CHATBOT_BASE,
  timeout: 70000,
  headers: { "Content-Type": "application/json" },
});

chatbotAxios.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/*  Axios cho admin config (direct tới chatbot server)  */
const adminAxios = axios.create({
  baseURL: `${CHATBOT_BASE}/admin`,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

adminAxios.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

//  Service

const chatbotService = {
  /** Gửi tin nhắn chat (public) */
  sendMessage: (
    message: string,
    history: ChatbotMessage[] = [],
  ): Promise<ChatbotResponse> =>
    chatbotAxios.post("", { prompt: message, history }).then((r) => r.data),

  //  Admin APIs

  /** Lấy toàn bộ config (admin) */
  getConfig: (): Promise<ChatbotConfig> =>
    adminAxios.get("/config").then((r) => r.data),

  /** Cập nhật config (partial update) */
  updateConfig: (
    partial: Partial<ChatbotConfig>,
  ): Promise<ChatbotConfigMutationResponse> =>
    adminAxios.put("/config", partial).then((r) => r.data),

  /** Reset config về mặc định  */
  resetConfig: (): Promise<ChatbotConfigMutationResponse> =>
    adminAxios.post("/config/reset").then((r) => r.data),

  /** Lấy giá trị mặc định */
  getDefaults: (): Promise<ChatbotConfig> =>
    adminAxios.get("/config/defaults").then((r) => r.data),

  //  Widget API (public, no auth)

  /** Lấy config cho widget (public — không cần admin key) */
  getWidgetConfig: (): Promise<WidgetConfig> =>
    chatbotAxios.get("/admin/widget-config").then((r) => r.data),
};

export default chatbotService;
