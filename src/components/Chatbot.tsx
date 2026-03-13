import { useState, useRef, useEffect } from 'react';
import { FiMessageSquare, FiX, FiSend, FiUser, FiCpu } from 'react-icons/fi';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isChatWithAdmin, setIsChatWithAdmin] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Xin chào! Tôi là trợ lý AI của Hozitech. Tôi có thể giúp gì cho bạn hôm nay?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Keep the chat instance in a ref to maintain history
  const chatRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    if (isChatWithAdmin) {
      setTimeout(() => {
        const adminMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: 'Chào bạn, tôi là nhân viên hỗ trợ. Hiện tại các chuyên viên đang bận, vui lòng để lại lời nhắn hoặc liên hệ hotline 1900 xxxx để được hỗ trợ nhanh nhất.',
        };
        setMessages((prev) => [...prev, adminMessage]);
        setIsLoading(false);
      }, 1500);
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY });
      
      // Initialize chat session if it doesn't exist
      if (!chatRef.current) {
        chatRef.current = ai.chats.create({
          model: 'gemini-3-flash-preview',
          config: {
            systemInstruction: 'Bạn là trợ lý AI thân thiện của Hozitech - một nền tảng thương mại điện tử công nghệ. Hãy trả lời ngắn gọn, lịch sự và hữu ích bằng tiếng Việt.',
          },
        });
      }

      const response = await chatRef.current.sendMessage({ message: userMessage.text });

      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text || 'Xin lỗi, tôi không thể trả lời lúc này.',
      };

      setMessages((prev) => [...prev, modelMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
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

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-full shadow-lg shadow-purple-500/30 flex items-center justify-center hover:scale-110 transition-transform z-50 ${isOpen ? 'hidden' : ''}`}
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
            className="fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[500px] min-w-[300px] min-h-[400px] max-w-[90vw] max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col z-50 overflow-hidden"
            style={{ resize: 'both' }}
          >
            {/* Header */}
            <div className="h-16 bg-gradient-to-r from-purple-600 to-blue-500 text-white flex items-center justify-between px-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  {isChatWithAdmin ? <FiUser className="text-xl" /> : <FiCpu className="text-xl" />}
                </div>
                <div>
                  <h3 className="font-bold">{isChatWithAdmin ? 'Hỗ trợ viên' : 'Hozitech AI'}</h3>
                  <p className="text-xs text-white/80">{isChatWithAdmin ? 'Trực tuyến' : 'Trợ lý ảo 24/7'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsChatWithAdmin(!isChatWithAdmin)}
                  className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded-lg transition-colors whitespace-nowrap"
                >
                  {isChatWithAdmin ? 'Chat với AI' : 'Gặp Admin'}
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
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'}`}>
                    {msg.role === 'user' ? <FiUser /> : <FiCpu />}
                  </div>
                  <div
                    className={`max-w-[75%] p-3 rounded-2xl text-sm ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-none shadow-sm'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      msg.text
                    ) : (
                      <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-slate-800 prose-pre:text-slate-100">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <FiCpu />
                  </div>
                  <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1 items-center">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
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
                  placeholder="Nhập tin nhắn..."
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
