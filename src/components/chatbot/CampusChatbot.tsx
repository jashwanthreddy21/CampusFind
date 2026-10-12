import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  ChevronRight, 
  GraduationCap, 
  Building2, 
  Copy, 
  Check, 
  MessageSquare, 
  ExternalLink,
  HelpCircle,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { College, ExamStream } from '../../types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

interface CampusChatbotProps {
  isOpen: boolean;
  onToggle: () => void;
  examStream: ExamStream;
  selectedState: 'all' | 'TS' | 'AP';
  allColleges: College[];
  onSelectCollege?: (college: College) => void;
}

const PRESET_PROMPTS = [
  { label: '🎯 Recommend for my Rank', prompt: 'I need college recommendations based on my rank. What details should I provide?' },
  { label: '🏛️ CBIT vs VNR VJIET', prompt: 'Which is better: CBIT Gandipet or VNR VJIET Bachupally for Computer Science?' },
  { label: '❄️ JoSAA Freeze vs Float vs Slide', prompt: 'Explain the difference between Freeze, Float, and Slide in JoSAA counseling with recommendations on what to pick.' },
  { label: '💰 Fee Reimbursement (ePASS & JVD)', prompt: 'How does Telangana ePASS fee reimbursement work for TS EAMCET ranks below and above 10,000?' },
  { label: '🚀 Top CSE Colleges in Telangana', prompt: 'What are the top 5 engineering colleges for CSE in Telangana with their typical cutoff brackets?' },
  { label: '🎓 NIT Warangal vs IIT Hyderabad', prompt: 'Compare NIT Warangal CSE with IIT Hyderabad CSE in terms of placements, curriculum, and campus life.' },
];

export const CampusChatbot: React.FC<CampusChatbotProps> = ({
  isOpen,
  onToggle,
  examStream,
  selectedState,
  allColleges,
  onSelectCollege,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'welcome-1',
        role: 'model',
        content: `### 👋 Namaste & Welcome to CampusFind AI Counselor!

I am your dedicated engineering admissions advisor. You can ask me anything about:
- **IITs, NITs, and IIITs** (JEE Advanced, JEE Main, JoSAA & CSAB counseling)
- **Telangana & Andhra Pradesh Engineering Colleges** (TG & AP EAMCET / EAPCET)
- **Cutoffs, Placements, Fees, and Web Option Filling Strategies**

Select a quick question below or ask me about your rank and dream colleges!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [hasUnread, setHasUnread] = useState(false);
  const [showTeaser, setShowTeaser] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
      setShowTeaser(false);
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, messages]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'reset-1',
        role: 'model',
        content: `### 🔄 Chat cleared.
How can I assist you with your college counseling and engineering admissions today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputQuery).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context: {
            examStream,
            selectedState,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const replyContent = data.reply || 'I am sorry, but I could not formulate a response at this moment. Please try again.';

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: 'model',
          content: replyContent,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      if (!isOpen) {
        setHasUnread(true);
      }
    } catch (err) {
      console.error('Chatbot error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          role: 'model',
          content: `⚠️ I had trouble connecting to the counseling server. Here is quick guidance:
- For **TS EAMCET / AP EAMCET**: Top colleges include CBIT, VNR VJIET, Vasavi, AUCE, JNTUK.
- For **JoSAA**: Use *Float* if you want higher choices across rounds, *Freeze* if you are fully satisfied with your seat.
Please feel free to ask again!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to extract recognized colleges from assistant message for quick one-click navigation
  const detectReferencedColleges = (text: string): College[] => {
    if (!allColleges || allColleges.length === 0) return [];
    const textLower = text.toLowerCase();
    const matched: College[] = [];
    const seenIds = new Set<string>();

    for (const college of allColleges) {
      if (seenIds.size >= 4) break;
      const codeMatch = college.code && text.includes(college.code);
      const nameMatch = college.shortName && textLower.includes(college.shortName.toLowerCase());
      
      if (codeMatch || nameMatch) {
        if (!seenIds.has(college.id)) {
          seenIds.add(college.id);
          matched.push(college);
        }
      }
    }
    return matched;
  };

  // Formats text into simple Markdown blocks (Headings, bold text, bullet points, tables)
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');

    return (
      <div className="space-y-2 text-sm leading-relaxed text-slate-800">
        {lines.map((line, idx) => {
          const trimmed = line.trim();

          if (!trimmed) {
            return <div key={idx} className="h-1.5" />;
          }

          // Headings ###
          if (trimmed.startsWith('### ')) {
            return (
              <h4 key={idx} className="text-base font-bold text-slate-900 mt-2 mb-1 flex items-center gap-1.5">
                {trimmed.replace('### ', '')}
              </h4>
            );
          }
          if (trimmed.startsWith('## ')) {
            return (
              <h3 key={idx} className="text-lg font-bold text-slate-900 mt-2.5 mb-1.5">
                {trimmed.replace('## ', '')}
              </h3>
            );
          }

          // Bullet points (- or * or numbered like 1.)
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const bulletText = trimmed.substring(2);
            return (
              <div key={idx} className="flex items-start gap-2 pl-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(bulletText) }} />
              </div>
            );
          }

          const numberMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
          if (numberMatch) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-1.5">
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 rounded px-1.5 py-0.5 mt-0.5 shrink-0">
                  {numberMatch[1]}
                </span>
                <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(numberMatch[2]) }} />
              </div>
            );
          }

          // Normal paragraph with inline formatting
          return (
            <p key={idx} dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(trimmed) }} />
          );
        })}
      </div>
    );
  };

  const formatInlineMarkdown = (text: string): string => {
    return text
      // Bold **text**
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>')
      // Inline code `code`
      .replace(/`([^`]+)`/g, '<code class="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded text-xs font-mono font-bold">$1</code>');
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end">
        {/* Teaser Bubble (visible initially when closed) */}
        {!isOpen && showTeaser && (
          <div className="mb-2 sm:mb-3 max-w-[280px] sm:max-w-xs bg-white text-slate-800 p-3 sm:p-3.5 rounded-2xl shadow-xl border border-indigo-100 flex items-start gap-2.5 sm:gap-3 animate-fade-in relative">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="text-xs">
              <p className="font-bold text-slate-900">Need counseling guidance?</p>
              <p className="text-slate-500 mt-0.5 text-[11px] sm:text-xs">Ask AI Counselor about rank cutoffs, IIT/NITs & JoSAA options.</p>
              <button
                onClick={() => {
                  setShowTeaser(false);
                  onToggle();
                }}
                className="mt-1.5 text-indigo-600 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer text-xs"
              >
                Start chat <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <button
              onClick={() => setShowTeaser(false)}
              className="text-slate-400 hover:text-slate-600 p-1 -mr-1 -mt-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Floating Action Button */}
        <button
          onClick={onToggle}
          aria-label={isOpen ? 'Close AI Counselor' : 'Open AI Counselor'}
          className={`relative flex items-center justify-center gap-2 px-3.5 py-3 sm:px-4 sm:py-3.5 rounded-full shadow-2xl transition-all duration-300 cursor-pointer ${
            isOpen
              ? 'bg-slate-900 hover:bg-slate-800 text-white'
              : 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white hover:scale-105 shadow-indigo-500/30 ring-4 ring-indigo-100'
          }`}
        >
          {isOpen ? (
            <>
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm font-bold">Close</span>
            </>
          ) : (
            <>
              <div className="relative">
                <Bot className="w-4 h-4 sm:w-5 sm:h-5 animate-bounce-gentle" />
                <span className="absolute -top-1 -right-1 w-2 sm:w-2.5 h-2 sm:h-2.5 bg-emerald-400 rounded-full border-2 border-indigo-700" />
              </div>
              <span className="text-xs sm:text-sm font-bold tracking-tight">AI Counselor</span>
              <span className="hidden xs:inline-block sm:inline-block bg-white/20 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-full">
                Gemini
              </span>
            </>
          )}

          {/* Unread indicator */}
          {!isOpen && hasUnread && (
            <span className="absolute -top-1 -left-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white animate-ping" />
          )}
        </button>
      </div>

      {/* Chat Window Modal / Drawer */}
      {isOpen && (
        <div 
          className={`fixed bottom-16 sm:bottom-24 right-2 sm:right-6 left-2 sm:left-auto z-50 bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden transition-all duration-300 ${
            isExpanded
              ? 'w-auto sm:w-[650px] md:w-[720px] h-[88vh] max-h-[820px]'
              : 'w-auto sm:w-[440px] md:w-[460px] h-[78vh] sm:h-[600px] max-h-[82vh]'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 flex items-center justify-between border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600/40 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shadow-inner">
                  <Bot className="w-5 h-5 text-indigo-200" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900 shadow-xs" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                    CampusFind AI Counselor
                  </h3>
                  <span className="bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 text-[10px] font-bold px-1.5 py-0.2 rounded-md">
                    Gemini 3.8 Flash
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 flex items-center gap-1">
                  <span>JoSAA, TS & AP EAMCET Admissions Expert</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Clear History */}
              <button
                onClick={handleClearHistory}
                title="Clear Conversation"
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Expand / Minimize */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Restore Size' : 'Expand View'}
                className="hidden sm:block p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {/* Close Window */}
              <button
                onClick={onToggle}
                title="Close Window"
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Context Banner */}
          <div className="bg-indigo-50/80 px-4 py-1.5 border-b border-indigo-100 flex items-center justify-between text-xs text-indigo-900 shrink-0">
            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="text-[10px] font-extrabold uppercase text-indigo-600 bg-white px-1.5 py-0.5 rounded border border-indigo-200">
                Active Context
              </span>
              <span className="font-semibold text-slate-700">
                {examStream === 'jee-advanced' ? 'IITs (JEE Advanced)' : examStream === 'jee-main' ? 'NITs & IIITs (JEE Main)' : `EAMCET (${selectedState === 'all' ? 'TS & AP' : selectedState})`}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 hidden sm:inline">24/7 Verified Cutoffs</span>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.map((message) => {
              const isUser = message.role === 'user';
              const referencedColleges = !isUser ? detectReferencedColleges(message.content) : [];

              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`max-w-[85%] sm:max-w-[80%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`p-3.5 rounded-2xl shadow-xs ${
                        isUser
                          ? 'bg-indigo-600 text-white rounded-tr-xs text-sm'
                          : 'bg-white text-slate-900 border border-slate-200/80 rounded-tl-xs'
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      ) : (
                        renderFormattedContent(message.content)
                      )}
                    </div>

                    {/* Detected College Quick-Pills */}
                    {!isUser && referencedColleges.length > 0 && onSelectCollege && (
                      <div className="mt-2 flex flex-wrap gap-1.5 pl-1">
                        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 self-center">
                          <Building2 className="w-3 h-3 text-indigo-500" /> College Info:
                        </span>
                        {referencedColleges.map((col) => (
                          <button
                            key={col.id}
                            onClick={() => onSelectCollege(col)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold bg-white hover:bg-indigo-50 text-indigo-700 hover:text-indigo-900 border border-indigo-200 px-2 py-0.5 rounded-lg shadow-2xs transition-colors cursor-pointer"
                          >
                            <span>{col.code || col.shortName}</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Message Metadata & Copy */}
                    <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-slate-400">
                      <span>{message.timestamp}</span>
                      {!isUser && (
                        <button
                          onClick={() => handleCopy(message.id, message.content)}
                          className="hover:text-slate-600 flex items-center gap-0.5 transition-colors cursor-pointer"
                          title="Copy message"
                        >
                          {copiedId === message.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing Loader */}
            {isLoading && (
              <div className="flex gap-3 justify-start items-center">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-xs flex items-center gap-2.5 shadow-xs">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    AI Counselor is evaluating cutoff trends & options...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Preset Prompts Carousel */}
          <div className="p-2.5 bg-white border-t border-slate-100 shrink-0">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 pl-1">
                Suggested:
              </span>
              {PRESET_PROMPTS.map((p, i) => (
                <button
                  key={i}
                  disabled={isLoading}
                  onClick={() => handleSend(p.prompt)}
                  className="shrink-0 text-xs font-medium bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 px-2.5 py-1 rounded-xl transition-all border border-slate-200 hover:border-indigo-200 cursor-pointer disabled:opacity-50"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-slate-200 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Ask about ranks, cutoffs, CBIT vs VNR, JoSAA..."
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-3.5 pr-3 py-2.5 text-sm rounded-xl bg-slate-100 focus:bg-white border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-400 text-slate-900 disabled:opacity-60"
                />
              </div>

              <button
                type="submit"
                disabled={!inputQuery.trim() || isLoading}
                aria-label="Send query"
                className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-slate-400">
              <span>CampusFind admissions guidance</span>
              <span>Always verify with official JoSAA / EAMCET portals</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
