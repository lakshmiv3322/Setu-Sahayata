'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, Bot, AlertCircle, Mic, MicOff, Volume2 } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { useVoiceAssistant } from '@/hooks/use-voice-assistant';

interface Message {
  role: 'user' | 'bot';
  text: string;
}

export function FloatingAssistant() {
  const { language, t } = useLanguage();
  const { isListening, isSpeaking, startListening, stopListening, speak, stopSpeaking } = useVoiceAssistant();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      text: t(
        {
          en: 'Namaste! 🙏 I am Setu AI. Ask me about any government welfare scheme — PM SVANidhi, Mudra, Ayushman Bharat, PMAY, and more!',
          hi: 'नमस्ते! 🙏 मैं सेतु AI हूं। किसी भी सरकारी कल्याण योजना — पीएम स्वनिधि, मुद्रा, आयुष्मान भारत, पीएमएवाई और अन्य के बारे में पूछें!',
          ta: 'வணக்கம்! 🙏 நான் சேது AI. அரசு நலத்திட்டங்கள் குறித்து கேட்கவும்!',
          te: 'నమస్కారం! 🙏 నేను సేతు AI. ప్రభుత్వ సంక్షేమ పథకాల గురించి నన్ను అడగండి!',
          bn: 'নমস্কার! 🙏 আমি সেতু AI। যে কোনো সরকারি কল্যাণ প্রকল্প সম্পর্কে জিজ্ঞাসা করুন!',
          mr: 'नमस्कार! 🙏 मी सेतू AI आहे. कोणत्याही सरकारी योजनेबद्दल मला विचारा!',
        }
      ),
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  // Handle ESC key to close assistant (A11y pass)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) setOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening((text) => {
        if (text) {
          setInput(text);
        }
      });
    }
  };

  const sendMessage = async (overrideText?: string) => {
    const text = (overrideText || input).trim();
    if (!text || typing) return;
    setInput('');
    setApiError(null);

    const updatedMessages: Message[] = [...messages, { role: 'user', text }];
    setMessages(updatedMessages);
    setTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role === 'bot' ? 'model' : 'user', text: m.text })),
          language,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setApiError(data.error ?? 'Something went wrong. Please try again.');
        const errorReply = t('Sorry, I am having trouble right now. Please try again.', 'माफ़ करें, मुझे अभी समस्या हो रही है। कृपया पुनः प्रयास करें।');
        setMessages((prev) => [...prev, { role: 'bot', text: errorReply }]);
      } else {
        const reply = data.reply;
        setMessages((prev) => [...prev, { role: 'bot', text: reply }]);
      }
    } catch {
      setApiError('Network error — please check your connection.');
      const netReply = t('Network error. Please check connection.', 'नेटवर्क समस्या। कनेक्शन जाँचें।');
      setMessages((prev) => [...prev, { role: 'bot', text: netReply }]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        id="floating-assistant-btn"
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={open ? {} : { y: [0, -6, 0] }}
        transition={open ? {} : { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-trust-500 to-trust-700 shadow-2xl shadow-trust-500/40 text-white focus-visible:ring-2 focus-visible:ring-trust-500 focus-visible:ring-offset-2"
        aria-label={open ? 'Close Setu AI Assistant' : 'Open Setu AI Assistant'}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageSquare className="h-6 w-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Pulse ring */}
      {!open && (
        <motion.div
          className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-trust-400/30 pointer-events-none"
          animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Setu AI Chat Assistant"
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 z-50 flex h-[520px] w-[340px] flex-col overflow-hidden rounded-3xl border border-trust-100 bg-white shadow-2xl shadow-trust-500/20"
          >
            {/* Header */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-trust-600 to-trust-800 px-5 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Setu AI</p>
                <p className="text-xs text-trust-200">
                  {t('Ask about any government scheme', 'किसी भी योजना के बारे में पूछें')}
                </p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => (isSpeaking ? stopSpeaking() : speak(messages[messages.length - 1]?.text || ''))}
                  className="text-white/80 hover:text-white transition-colors"
                  title={t('Read response aloud', 'उत्तर पढ़कर सुनाएं')}
                >
                  <Volume2 className={`h-4 w-4 ${isSpeaking ? 'text-emerald-300 animate-pulse' : ''}`} />
                </button>
                <div className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow shadow-emerald-400/60" />
              </div>
            </div>

            {/* API error banner */}
            <AnimatePresence>
              {apiError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 bg-rose-50 px-4 py-2 text-xs text-rose-700"
                >
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {apiError}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-trust-50/30 to-white">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'bot' && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-trust-100 text-trust-600">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-trust-600 text-white rounded-tr-sm'
                        : 'bg-white text-trust-900 shadow-sm border border-trust-100 rounded-tl-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {typing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-trust-100 text-trust-600">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-white px-4 py-3 shadow-sm border border-trust-100">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="h-2 w-2 rounded-full bg-trust-400"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input & Voice Controls */}
            <div className="border-t border-trust-100 bg-white p-3">
              <div className="flex gap-2">
                <input
                  id="assistant-input"
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder={isListening ? t('Listening...', 'सुन रहे हैं...') : t('Ask or tap mic...', 'पूछें या माइक दबाएं...')}
                  disabled={typing}
                  className={`flex-1 rounded-xl border px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 placeholder:text-muted-foreground disabled:opacity-60 ${
                    isListening
                      ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 focus:ring-emerald-500/20'
                      : 'border-trust-200 bg-trust-50/50 text-trust-900 focus:border-trust-500 focus:ring-trust-500/20'
                  }`}
                />

                {/* Voice Input Mic Button */}
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  title={isListening ? t('Stop Listening', 'सुनना बंद करें') : t('Voice Input', 'आवाज से पूछें')}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                    isListening
                      ? 'bg-emerald-600 text-white animate-pulse shadow-md shadow-emerald-500/30'
                      : 'bg-trust-100 text-trust-700 hover:bg-trust-200'
                  }`}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>

                <button
                  id="assistant-send-btn"
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || typing}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-trust-600 text-white shadow-md transition hover:bg-trust-700 disabled:opacity-40"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 text-center text-[10px] text-muted-foreground">
                Setu AI · Web Speech API Voice · Powered by Gemini
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
