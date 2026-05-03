export interface ChatbotMessage {
  role: 'user' | 'bot';
  content: string;
}

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

export interface ChatbotShopInfo {
  name: string;
  slogan: string;
  address: string;
  hotline: string;
  email: string;
  website: string;
  payments: string[];
}

export interface BotConfig {
  name: string;
  subtitle: string;
  welcomeMessage: string;
  themeColor: string;
  avatarUrl: string;
}

export interface AIConfig {
  model: string;
  provider?: 'gemini' | 'openai';
  availableModels?: ChatbotModelOption[];
  temperature: number;
  systemRules: string;
  enableResponseSynthesis?: boolean;
  maxProducts?: number;
  planTimeoutMs?: number;
  maxRetries?: number;
  dbTimeoutMs?: number;
}

export interface ChatbotConfig {
  shopInfo: ChatbotShopInfo;
  bot: BotConfig;
  ai: AIConfig;
  suggestions: string[];
  isEnabled: boolean;
}

export interface WidgetConfig {
  bot: BotConfig;
  suggestions: string[];
  isEnabled: boolean;
}

export interface ChatbotConfigMutationResponse {
  message: string;
  config: ChatbotConfig;
}

export interface ChatbotModelOption {
  value: string;
  label: string;
  provider?: 'gemini' | 'openai';
  source?: 'defined' | 'current' | 'fallback';
}

export interface ChatbotModelCatalogResponse {
  source: 'defined' | 'fallback';
  currentModel?: string;
  fetchedAt?: string;
  models: ChatbotModelOption[];
}
