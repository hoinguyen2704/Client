import { useState, useRef, useEffect } from 'react';
import { FiMessageSquare, FiX, FiSend, FiUser, FiCpu, FiTrash2 } from 'react-icons/fi';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import chatbotService from '@/apis/services/chatbotService';
import type { ChatbotMessage, ChatbotResponse, WidgetConfig } from '@/apis/services/chatbotService';
import type { Message } from './types';
import { SHOP } from '@/constants/shopConstants';

/* ─── Defaults nếu API chưa tải được ─── */
const DEFAULT_CONFIG: WidgetConfig = {
  bot: {
    name: `${SHOP.name} AI`,
    subtitle: 'Trợ lý tư vấn sản phẩm 24/7',
    welcomeMessage:
      `Xin chào! Tôi là trợ lý AI của **${SHOP.name}** 🤖\n\nTôi có thể giúp bạn:\n- 🔍 Tìm kiếm & tư vấn sản phẩm công nghệ\n- 💰 Xem giá, khuyến mãi, flash sale\n- ⭐ So sánh đánh giá sản phẩm\n- 📦 Tra cứu thông tin đơn hàng\n\nBạn cần hỗ trợ gì ạ?`,
    themeColor: '#9333ea',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=TechStore',
  },
  suggestions: ['Sản phẩm nổi bật', 'Điện thoại giá dưới 10 triệu', 'Có mã giảm giá nào không?', 'Gợi ý sản phẩm cho mình'],
  isEnabled: true,
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [widgetConfig, setWidgetConfig] = useState<WidgetConfig>(DEFAULT_CONFIG);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /* ─── Load widget config from server ─── */
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

  /* ─── Initialize welcome message from config ─── */
  useEffect(() => {
    if (configLoaded && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'model',
          text: widgetConfig.bot?.welcomeMessage || DEFAULT_CONFIG.bot.welcomeMessage,
        },
      ]);
    }
  }, [configLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /* ─── Config values ─── */
  const botName = widgetConfig.bot?.name || DEFAULT_CONFIG.bot.name;
  const botSubtitle = widgetConfig.bot?.subtitle || DEFAULT_CONFIG.bot.subtitle;
  const themeColor = widgetConfig.bot?.themeColor || DEFAULT_CONFIG.bot.themeColor;
  const avatarUrl = widgetConfig.bot?.avatarUrl || '';
  const suggestions = widgetConfig.suggestions?.length ? widgetConfig.suggestions : DEFAULT_CONFIG.suggestions;

  /**
   * Chuyển đổi messages nội bộ (role: 'user'|'model') → ChatbotMessage (role: 'user'|'bot')
   * Chatbot server expect role = 'bot' cho assistant messages.
   */
  const buildHistory = (): ChatbotMessage[] => {
    return messages
      .filter((m) => m.id !== 'welcome')
      .map((m) => ({
        role: m.role === 'user' ? ('user' as const) : ('bot' as const),
        content: m.text,
      }));
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = buildHistory();
      const response: ChatbotResponse = await chatbotService.sendMessage(userText, history);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.answer || 'Xin lỗi, tôi không thể trả lời lúc này.',
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error: any) {
      console.error('[Chatbot Error]', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: 'Xin lỗi, đã có lỗi kết nối đến hệ thống. Vui lòng thử lại sau hoặc liên hệ hotline **' + SHOP.hotline + '** để được hỗ trợ.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        text: 'Cuộc trò chuyện đã được xóa. Tôi có thể giúp gì cho bạn?',
      },
    ]);
  };

  const handleSuggestion = (text: string) => {
    setInput(text);
    setTimeout(() => {
      const fakeEvent = { key: 'Enter', shiftKey: false, preventDefault: () => {} };
      handleKeyDown(fakeEvent as React.KeyboardEvent);
    }, 100);
  };

  const showSuggestions = messages.length <= 1 && !isLoading;

  /* ─── Ẩn widget nếu admin tắt chatbot ─── */
  if (widgetConfig.isEnabled === false) return null;

  /* ─── Dynamic gradient style from theme color ─── */
  const gradientStyle = { background: 'linear-gradient(135deg, ' + themeColor + ', #3b82f6)' };
  const shadowStyle = { boxShadow: '0 10px 25px -5px ' + themeColor + '40' };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={'fixed bottom-6 right-6 w-14 h-14 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-50 ' + (isOpen ? 'hidden' : '')}
        style={{ ...gradientStyle, ...shadowStyle }}
        aria-label="Mở chatbot"
      >
        <FiMessageSquare className="text-2xl" />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 w-[380px] sm:w-[420px] h-[560px] min-w-[320px] min-h-[400px] max-w-[90vw] max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col z-50 overflow-hidden"
            style={{ resize: 'both' }}
          >
            {/* Header */}
            <div className="h-16 text-white flex items-center justify-between px-4 shrink-0" style={gradientStyle}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Bot" className="w-full h-full object-cover" />
                  ) : (
                    <FiCpu className="text-xl" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold">{botName}</h3>
                  <p className="text-xs text-white/80">{botSubtitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleClearChat}
                  title="Xóa cuộc trò chuyện"
                  className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors"
                >
                  <FiTrash2 className="text-base" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors"
                >
                  <FiX className="text-xl" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/50">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={'flex gap-3 ' + (msg.role === 'user' ? 'flex-row-reverse' : '')}
                >
                  <div
                    className={'w-8 h-8 rounded-full flex items-center justify-center shrink-0 ' + (
                      msg.role === 'user'
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                    )}
                  >
                    {msg.role === 'user' ? <FiUser /> : <FiCpu />}
                  </div>
                  <div
                    className={'max-w-[80%] p-3 rounded-2xl text-sm ' + (
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-none shadow-sm'
                    )}
                  >
                    {msg.role === 'user' ? (
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
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <FiCpu />
                  </div>
                  <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1.5 items-center">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              {/* Quick suggestions */}
              {showSuggestions && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-wrap gap-2 pt-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSuggestion(s)}
                      className="text-xs px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
              <div className="relative flex items-center">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Hỏi về sản phẩm, giá cả, khuyến mãi..."
                  className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl pl-4 pr-12 py-3 text-sm focus:ring-2 focus:ring-purple-500 resize-none h-[44px] max-h-[120px] overflow-y-auto"
                  rows={1}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 w-8 h-8 flex items-center justify-center text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  <FiSend />
                </button>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-1.5 text-center">
                Powered by {botName} + AI
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
