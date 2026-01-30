import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { HiXMark, HiPaperAirplane, HiChatBubbleOvalLeftEllipsis, HiChevronDown, HiSparkles, HiBookOpen, HiChatBubbleLeftRight, HiListBullet, HiBolt } from 'react-icons/hi2';
import { FaRobot } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import AIGenerateModal from './AIGenerateModal';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const CHAT_STYLES = [
  { id: 'friendly', label: 'Thân thiện', icon: '🤗' },
  { id: 'professional', label: 'Chuyên gia', icon: '🧐' },
  { id: 'concise', label: 'Ngắn gọn', icon: '⚡' },
  { id: 'socratic', label: 'Gợi mở', icon: '🤔' },
];

const AIChatWidget: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMagicModalOpen, setIsMagicModalOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: 'Xin chào! Mình là trợ lý AI của FlipLab. Mình có thể giúp gì cho việc học của bạn hôm nay?',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatStyle, setChatStyle] = useState('friendly');
  const [isStyleMenuOpen, setIsStyleMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-hide tooltip after 5 seconds
  const [showTooltip, setShowTooltip] = useState(true);
  const [timeLeft, setTimeLeft] = useState(15.0);
  const [quotaUsage, setQuotaUsage] = useState({ used: 0, total: 20, remaining: 20 });
  
  // Quick Actions (Suggestions)
  const QUICK_ACTIONS = [
    { label: 'Tạo thẻ Magic AI', icon: <HiSparkles className="text-purple-500" />, isMagic: true },
    { label: 'Giải thích', icon: <HiBookOpen />, prompt: 'Giải thích chi tiết về khái niệm này: ' },
    { label: 'Cho ví dụ', icon: <HiChatBubbleLeftRight />, prompt: 'Lấy ví dụ minh họa dễ hiểu cho: ' },
    { label: 'Tóm tắt', icon: <HiListBullet />, prompt: 'Tóm tắt ngắn gọn các ý chính của: ' },
  ];

  useEffect(() => {
    let interval: any;
    if (isTyping) {
      // Countdown logic only - initialization happens in handleSendMessage
      interval = setInterval(() => {
        setTimeLeft(prev => Math.max(0, prev - 0.1));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isTyping]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = async (overrideInput?: string) => {
    const finalInputValue = overrideInput || inputValue;
    if (!finalInputValue.trim()) return;

    // 1. Check Local Quota before sending
    if (quotaUsage.remaining <= 0) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: '💔 Bạn đã hết 20 lượt miễn phí hôm nay rồi. Quay lại vào ngày mai nhé!',
        sender: 'ai',
        timestamp: new Date()
      }]);
      return;
    }

    // 2. Add User Message & UI Updates
    const userMsg: Message = {
      id: Date.now().toString(),
      text: finalInputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    
    // Smart Time Estimation
    const estimatedTime = 2.5 + (finalInputValue.length * 0.05) + (Math.random() * 1.5);
    setTimeLeft(Math.min(estimatedTime, 20));

    setInputValue('');
    setIsTyping(true);

    try {
      // 3. Call Real API
      const response = await api.post('/ai/chat', { 
        message: finalInputValue,
        style: chatStyle 
      });
      
      const aiResponseText = response.data.reply || "Xin lỗi, mình đang gặp chút trục trặc.";
      
      // 4. Update Quota from Server Response
      if (response.data.usage) {
        setQuotaUsage(response.data.usage);
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMsg]);
      
    } catch (error) {
      console.error('Chat error', error);
      const errorMsg: Message = {
        id: Date.now().toString(),
        text: 'Mất kết nối với Server... 😿 Bạn kiểm tra lại mạng xem sao nhé!',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };
  
  // Helper to trigger send from Quick Actions
  const handleQuickAction = (promptPrefix: string) => {
    // If input is empty, just set the prefix. If has text, prepend prefix and send.
    if (!inputValue.trim()) {
      setInputValue(promptPrefix);
      // Focus textarea (optional if using ref)
    } else {
      const fullMessage = `${promptPrefix} ${inputValue}`;
      handleSendMessage(fullMessage);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[350px] md:w-[400px] h-[500px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 fade-in duration-300">
          
          {/* Header */}
          <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                <FaRobot className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <h3 className="font-bold text-white text-sm">AI Tutor (Beta)</h3>
                <div className="flex items-center gap-1 mt-0.5">
                   <span 
                      className="text-[10px] text-blue-100 bg-white/20 px-1.5 py-0.5 rounded flex items-center gap-1 cursor-help"
                      title="Giới hạn 20 lượt mỗi ngày. Reset vào 00:00."
                   >
                      <HiBolt className="w-3 h-3 text-yellow-300" />
                      {quotaUsage.remaining}/{quotaUsage.total} lượt
                   </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] text-blue-50/80 font-medium select-none">Phong cách:</span>
                  <div className="relative" title="Chọn phong cách trả lời của AI">
                    <button
                      onClick={() => setIsStyleMenuOpen(!isStyleMenuOpen)}
                      className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-[11px] px-2.5 py-1 rounded-full transition-all border border-white/10 hover:border-white/30 cursor-pointer shadow-sm"
                    >
                    <span>{CHAT_STYLES.find(s => s.id === chatStyle)?.icon}</span>
                    <span className="font-medium">{CHAT_STYLES.find(s => s.id === chatStyle)?.label}</span>
                    <HiChevronDown className={`w-3 h-3 transition-transform duration-200 ${isStyleMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isStyleMenuOpen && (
                    <>
                      {/* Invisible backdrop to close on click outside */}
                      <div className="fixed inset-0 z-40" onClick={() => setIsStyleMenuOpen(false)}></div>
                      
                      <div className="absolute top-full left-0 mt-1.5 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-600 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-left overflow-hidden">
                        <div className="px-3 py-1 text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 tracking-wider">
                          Phong cách
                        </div>
                        {CHAT_STYLES.map((style) => (
                          <button
                            key={style.id}
                            onClick={() => {
                              setChatStyle(style.id);
                              setIsStyleMenuOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer ${
                              chatStyle === style.id 
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold' 
                                : 'text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <span className="text-sm">{style.icon}</span>
                            {style.label}
                            {chatStyle === style.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/20 rounded-lg text-white transition-colors cursor-pointer"
            >
              <HiXMark className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/50">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed shadow-sm ${
                    msg.sender === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600 rounded-tl-none'
                  }`}
                >
                  {/* Use ReactMarkdown only for AI messages to prevent XSS from user, though libraries usually sanitize */}
                  {msg.sender === 'ai' ? (
                    <ReactMarkdown 
                      components={{
                        // @ts-ignore
                        p: ({node, ...props}) => <p className="mb-1 last:mb-0" {...props} />,
                        // @ts-ignore
                        strong: ({node, ...props}) => <strong className="font-bold text-indigo-600 dark:text-indigo-400" {...props} />,
                        // @ts-ignore
                        ul: ({node, ...props}) => <ul className="list-disc ml-4 mb-2" {...props} />,
                        // @ts-ignore
                        li: ({node, ...props}) => <li className="mb-0.5" {...props} />,
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}
            
             {/* Quick Actions (Show if few messages or last is from AI) */}
            {!isTyping && quotaUsage.remaining > 0 && (
               <div className="grid grid-cols-2 gap-2 mt-2">
                 {QUICK_ACTIONS.map((action, idx) => (
                   <button
                     key={idx}
                     onClick={() => {
                        // @ts-ignore
                        if (action.isMagic) {
                             setIsMagicModalOpen(true);
                             setIsOpen(false);
                        } else {
                             // @ts-ignore
                             handleQuickAction(action.prompt);
                        }
                     }}
                     className={`flex items-center gap-2 p-2.5 bg-white dark:bg-slate-800 border rounded-xl transition-all text-xs shadow-sm text-left cursor-pointer group ${
                        // @ts-ignore
                        action.isMagic 
                            ? 'border-purple-200 dark:border-purple-500/30 hover:bg-purple-50 dark:hover:bg-purple-900/10' 
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                     }`}
                   >
                     <div className={`shrink-0 transition-transform group-hover:scale-110 ${
                        // @ts-ignore
                        action.isMagic ? 'text-purple-600' : 'text-blue-600 dark:text-blue-400'
                     }`}>
                       {action.icon}
                     </div>
                     <span className={`font-medium ${
                        // @ts-ignore
                        action.isMagic ? 'text-purple-700 dark:text-purple-300' : 'text-slate-600 dark:text-slate-300'
                     }`}>{action.label}</span>
                   </button>
                 ))}
               </div>
            )}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl rounded-tl-none p-3 shadow-sm flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium tabular-nums border-l border-slate-200 dark:border-slate-600 pl-3">
                    {timeLeft.toFixed(1)}s
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 shrink-0">
            <div className="flex items-end gap-2 bg-slate-100 dark:bg-slate-700/50 rounded-xl p-2 border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Hỏi mình bất cứ điều gì..."
                className="flex-1 bg-transparent border-none outline-none text-slate-700 dark:text-slate-200 resize-none max-h-32 py-2 px-2 text-sm"
                rows={1}
                style={{ minHeight: '40px' }}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isTyping}
                className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:bg-slate-400 text-white rounded-lg transition-all shadow-md active:scale-95 cursor-pointer flex-shrink-0 mb-0.5"
              >
                <HiPaperAirplane className="w-5 h-5 -rotate-45 translate-x-0.5 -translate-y-0.5" />
              </button>
            </div>
            <p className="text-[10px] text-center text-slate-400 mt-2">
              AI có giới hạn 20 lượt/ngày. Hãy sử dụng tiết kiệm nhé!
            </p>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`group relative flex items-center justify-center w-14 h-14 rounded-full shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer z-50 overflow-hidden ${
          isOpen 
            ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rotate-90' 
            : 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white animate-bounce-slow'
        }`}
      >
        <span className="absolute inset-0 bg-white/20 group-hover:bg-white/30 transition-colors"></span>
        {isOpen ? (
          <HiXMark className="w-7 h-7" />
        ) : (
          <>
            <HiChatBubbleOvalLeftEllipsis className="w-7 h-7 relative z-10" />
            <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-green-400 border-2 border-blue-600 rounded-full z-20"></span>
          </>
        )}
      </button>

      {/* Intro Tooltip (Only show when closed and first load or hover) */}
      {!isOpen && showTooltip && (
        <div className="absolute bottom-16 right-0 w-48 bg-white dark:bg-slate-800 p-3 rounded-xl shadow-xl border border-blue-100 dark:border-blue-900/30 animate-in slide-in-from-right-10 fade-in duration-300 pointer-events-none z-40">
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white dark:bg-slate-800 transform rotate-45 border-r border-b border-blue-100 dark:border-blue-900/30"></div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2">
               <span className="text-xl">👋</span> Cần giúp gì không?
            </p>
        </div>
      )}
       {/* Magic AI Modal - Global Access */}
       <AIGenerateModal 
          isOpen={isMagicModalOpen}
          onClose={() => setIsMagicModalOpen(false)}
          onSuccess={(cards) => {
             // Navigate to create page with data
             navigate('/create', { 
               state: { 
                 generatedCards: cards,
                 deckTopic: 'Magic AI Deck' 
               } 
             });
             setIsMagicModalOpen(false);
          }}
       />
    </div>
  );
};

export default AIChatWidget;
