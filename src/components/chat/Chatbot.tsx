import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  FiX,
  FiSend,
  FiUser,
  FiCpu,
  FiTrash2,
} from "react-icons/fi";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import chatbotService from "@/apis/services/chatbotService";
import type {
  ChatbotMessage,
  ChatbotResponse,
  WidgetConfig,
} from "@/apis/services/chatbotService";
import type { Message } from "../ui/types";
import { SHOP } from "@/constants/shopConstants";

interface ChatbotProps {
  isOpen: boolean;
  isAnotherChatOpen?: boolean;
  onOpenChange: (open: boolean) => void;
}

const DEFAULT_CONFIG: WidgetConfig = {
  bot: {
    name: `${SHOP.name} AI`,
    subtitle: "",
    welcomeMessage: "",
    themeColor: "#2563eb",
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=TechStore",
  },
  suggestions: [],
  isEnabled: true,
};

const HISTORY_LIMITS = {
  maxMessages: 6,
  maxCharsPerMessage: 280,
  maxTotalChars: 1400,
};

function clipHistoryContent(input: string, maxChars: number): string {
  const normalized = input.replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  if (normalized.length <= maxChars) return normalized;
  return `${normalized.slice(0, Math.max(0, maxChars - 1)).trimEnd()}…`;
}

export default function Chatbot({
  isOpen,
  isAnotherChatOpen = false,
  onOpenChange,
}: ChatbotProps) {
  const { t } = useTranslation("layout");
  const [widgetConfig, setWidgetConfig] =
    useState<WidgetConfig>(DEFAULT_CONFIG);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fallbackConfig = useMemo<WidgetConfig>(
    () => ({
      bot: {
        ...DEFAULT_CONFIG.bot,
        subtitle: t("chatbot.defaultSubtitle"),
        welcomeMessage: t("chatbot.welcomeMessage", { shopName: SHOP.name }),
      },
      suggestions: [
        t("chatbot.suggestions.featured"),
        t("chatbot.suggestions.phoneBudget"),
        t("chatbot.suggestions.coupon"),
        t("chatbot.suggestions.recommend"),
      ],
      isEnabled: true,
    }),
    [t],
  );

  /*  Load widget config from server  */
  useEffect(() => {
    chatbotService
      .getWidgetConfig()
      .then((cfg) => {
        setWidgetConfig(cfg);
        setConfigLoaded(true);
      })
      .catch(() => {
        setConfigLoaded(true); // use defaults
      });
  }, []);

  /*  Initialize welcome message from config  */
  useEffect(() => {
    if (configLoaded && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "model",
          text:
            widgetConfig.bot?.welcomeMessage ||
            fallbackConfig.bot.welcomeMessage,
        },
      ]);
    }
  }, [configLoaded, fallbackConfig.bot.welcomeMessage, widgetConfig.bot?.welcomeMessage, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Memoize config values — avoid re-computation on every render
  const botName = useMemo(() => widgetConfig.bot?.name || fallbackConfig.bot.name, [fallbackConfig.bot.name, widgetConfig.bot?.name]);
  const botSubtitle = useMemo(() => widgetConfig.bot?.subtitle || fallbackConfig.bot.subtitle, [fallbackConfig.bot.subtitle, widgetConfig.bot?.subtitle]);
  const themeColor = useMemo(() => widgetConfig.bot?.themeColor || fallbackConfig.bot.themeColor, [fallbackConfig.bot.themeColor, widgetConfig.bot?.themeColor]);
  const avatarUrl = widgetConfig.bot?.avatarUrl || "";
  const launcherAvatarUrl = avatarUrl || "/logo.svg";
  const suggestions = useMemo(
    () => widgetConfig.suggestions?.length ? widgetConfig.suggestions : fallbackConfig.suggestions,
    [fallbackConfig.suggestions, widgetConfig.suggestions],
  );

  /**
   * Chuyển đổi messages nội bộ (role: 'user'|'model') → ChatbotMessage (role: 'user'|'bot')
   * Chatbot server expect role = 'bot' cho assistant messages.
   */
  const buildHistory = useCallback((): ChatbotMessage[] => {
    const normalized = messages
      .filter((m) => m.id !== "welcome")
      .slice(-HISTORY_LIMITS.maxMessages)
      .map((m) => ({
        role: m.role === "user" ? ("user" as const) : ("bot" as const),
        content: clipHistoryContent(
          m.text,
          HISTORY_LIMITS.maxCharsPerMessage,
        ),
      }))
      .filter((m) => m.content);

    let remaining = HISTORY_LIMITS.maxTotalChars;
    const trimmed: ChatbotMessage[] = [];

    for (let index = normalized.length - 1; index >= 0 && remaining > 0; index -= 1) {
      const message = normalized[index];
      const content = clipHistoryContent(
        message.content,
        Math.min(message.content.length, remaining),
      );
      if (!content) continue;
      trimmed.unshift({ ...message, content });
      remaining -= content.length;
    }

    return trimmed;
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      text: text.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const history = buildHistory();
      const response: ChatbotResponse = await chatbotService.sendMessage(
        text.trim(),
        history,
      );

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: response.answer || t("chatbot.fallbackAnswer"),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error: any) {
      console.error("[Chatbot Error]", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: t("chatbot.connectionError", { hotline: SHOP.hotline }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, buildHistory, t]);

  const handleSend = () => sendMessage(input);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "model",
        text: t("chatbot.clearConversation"),
      },
    ]);
  };

  // Fix: call sendMessage directly instead of faking keyboard events
  const handleSuggestion = useCallback((text: string) => {
    sendMessage(text);
  }, [sendMessage]);

  const showSuggestions = messages.length <= 1 && !isLoading;

  /*  Ẩn widget nếu admin tắt chatbot  */
  if (widgetConfig.isEnabled === false) return null;

  /*  Dynamic gradient style from theme color  */
  const gradientStyle = {
    background: "linear-gradient(135deg, " + themeColor + ", #3b82f6)",
  };
  const shadowStyle = { boxShadow: "0 10px 25px -5px " + themeColor + "40" };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => onOpenChange(true)}
        className={
          "fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-[60] overflow-hidden " +
          (isOpen || isAnotherChatOpen ? "hidden" : "")
        }
        style={{ ...gradientStyle, ...shadowStyle }}
        aria-label={t("chatbot.openAria")}
      >
        <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/18 ring-1 ring-white/30 backdrop-blur">
          {launcherAvatarUrl ? (
                    <img
                      src={launcherAvatarUrl}
                      alt={t("chatbot.avatarAlt")}
                      className="h-6 w-6 sm:h-7 sm:w-7 rounded-full object-cover"
                    />
          ) : (
            <FiCpu className="text-xl sm:text-2xl" />
          )}
        </span>
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed z-[70] bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden right-3 bottom-16 w-[280px] max-w-[82vw] h-[min(70dvh,560px)] sm:right-6 sm:bottom-6 sm:w-[420px] sm:h-[560px] sm:max-w-[90vw] sm:max-h-[90vh] resize-none sm:resize"
          >
            {/* Header */}
            <div
              className="h-14 sm:h-16 text-white flex items-center justify-between px-3 sm:px-4 shrink-0"
              style={gradientStyle}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={t("chatbot.avatarAlt")}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FiCpu className="text-xl" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-md sm:text-base truncate">{botName}</h3>
                  <p className="text-sm text-white/80 truncate">
                    {botSubtitle}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleClearChat}
                  title={t("chatbot.clearConversationTitle")}
                  className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors"
                >
                  <FiTrash2 className="text-base" />
                </button>
                <button
                  onClick={() => onOpenChange(false)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors"
                >
                  <FiX className="text-xl" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-slate-50 dark:bg-slate-900/50">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={
                    "flex gap-3 " +
                    (msg.role === "user" ? "flex-row-reverse" : "")
                  }
                >
                  <div
                    className={
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0 " +
                      (msg.role === "user"
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                        : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400")
                    }
                  >
                    {msg.role === "user" ? <FiUser /> : <FiCpu />}
                  </div>
                  <div
                    className={
                      "max-w-[92%] sm:max-w-[80%] p-2.5 sm:p-3 rounded-2xl text-md " +
                      (msg.role === "user"
                        ? "bg-blue-600 text-white rounded-tr-none"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-none shadow-sm")
                    }
                  >
                    {msg.role === "user" ? (
                      msg.text
                    ) : (
                      <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-headings:my-1">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <FiCpu />
                  </div>
                  <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1.5 items-center">
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              )}

              {/* Quick suggestions */}
              {showSuggestions && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-wrap gap-2 pt-2"
                >
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSuggestion(s)}
                      className="text-sm px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
              <div className="relative flex items-center">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t("chatbot.inputPlaceholder")}
                  className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl pl-3 sm:pl-4 pr-12 py-2.5 sm:py-3 text-md focus:ring-2 focus:ring-blue-500 resize-none h-[40px] sm:h-[44px] max-h-[120px] overflow-y-auto"
                  rows={1}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 w-8 h-8 flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  <FiSend />
                </button>
              </div>
              <p className="text-10 text-slate-400 dark:text-slate-600 mt-1.5 text-center">
                Powered by {botName} + AI
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
