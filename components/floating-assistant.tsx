'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, Bot } from 'lucide-react';

interface Message {
  role: 'user' | 'bot';
  text: string;
}

const FAQ: Record<string, string> = {
  'pm svanidhi': 'PM SVANidhi gives street vendors a collateral-free working capital loan of ₹10,000. If you repay on time, you get 0% interest and can upgrade to ₹20,000 then ₹50,000!',
  'svanidhi': 'PM SVANidhi gives street vendors a collateral-free loan up to ₹10,000. Repay on time → zero interest, and you unlock higher loan tiers!',
  'mudra': 'PM Mudra Yojana gives small business loans up to ₹10 lakh under three tiers: Shishu (₹50K), Kishore (₹5L), and Tarun (₹10L). No collateral needed!',
  'ayushman': 'Ayushman Bharat (PM-JAY) provides free health insurance of ₹5 lakh per family per year for secondary and tertiary hospital care.',
  'pmay': 'PMAY gives an interest subsidy on home loans — from ₹1 lakh up to ₹2.67 lakh depending on your income category (EWS/LIG/MIG).',
  'sukanya': 'Sukanya Samriddhi Yojana is a savings scheme for girl children under 10 years old, offering 8.2% interest — one of the highest in India.',
  'anna yojana': 'Antyodaya Anna Yojana gives the poorest families 35 kg of subsidized food grains (rice ₹3/kg, wheat ₹2/kg) every month.',
  'hello': 'Namaste! 🙏 I am Setu AI — your guide to government welfare schemes. Ask me about any scheme like PM SVANidhi, Mudra, Ayushman Bharat, or PMAY!',
  'hi': 'Namaste! 🙏 Ask me anything about government schemes — I am here to help!',
  'namaskar': 'Namaste! 🙏 Ask me anything about government welfare schemes!',
  'namaste': 'Namaste! 🙏 I can help you understand schemes like PM SVANidhi, Mudra Yojana, Ayushman Bharat, and more!',
  'aadhaar': 'Aadhaar is your 12-digit unique identity number. It is required for most government scheme applications. Make sure it is linked to your mobile number.',
  'ration card': 'Ration Card is used to get subsidized food grains and also acts as a proof of residence. It is needed for schemes like Ayushman Bharat and Antyodaya Anna Yojana.',
  'eligibility': 'Your eligibility depends on your income, social category (SC/ST/OBC/General), occupation, and documents. Go to the Discover page and upload your Aadhaar — we will match you instantly!',
  'apply': 'Go to the Dashboard, find a scheme you qualify for, and click "Apply Now". We will auto-fill 90% of the form from your profile!',
  'documents': 'The main documents you need are: Aadhaar Card, Ration Card, Bank Passbook, Passport-size photo, and sometimes an Udyam Certificate for business schemes.',
  'what is setu sahayata': 'Setu Sahayata means "Bridge to Help". We connect citizens to the government welfare schemes they deserve — but never knew about. We simplify, translate, and guide you through the entire process.',
  'how does it work': 'Simple! 1️⃣ Upload your Aadhaar or answer 3 questions. 2️⃣ We match you to schemes instantly. 3️⃣ Auto-fill and apply in one click!',
};

function getBotReply(input: string): string {
  const lower = input.toLowerCase().trim();
  for (const key of Object.keys(FAQ)) {
    if (lower.includes(key)) return FAQ[key];
  }
  return `I am not sure about that specific query, but I can help with PM SVANidhi, Mudra Yojana, Ayushman Bharat, PMAY, Sukanya Samriddhi, and more. Try asking about any of these! 😊`;
}

export function FloatingAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: 'Namaste! 🙏 I am Setu AI. Ask me about any government welfare scheme — PM SVANidhi, Mudra, Ayushman Bharat, PMAY, and more!' },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setTyping(true);
    // Simulate "AI thinking" delay
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
    const reply = getBotReply(text);
    setMessages((prev) => [...prev, { role: 'bot', text: reply }]);
    setTyping(false);
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
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-trust-500 to-trust-700 shadow-2xl shadow-trust-500/40 text-white"
        aria-label="Open Setu AI Assistant"
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
          className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-trust-400/30"
          animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 z-50 flex h-[480px] w-[340px] flex-col overflow-hidden rounded-3xl border border-trust-100 bg-white shadow-2xl shadow-trust-500/20"
          >
            {/* Header */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-trust-600 to-trust-800 px-5 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Setu AI</p>
                <p className="text-xs text-trust-200">Ask about any government scheme</p>
              </div>
              <div className="ml-auto flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow shadow-emerald-400/60" />
            </div>

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

            {/* Input */}
            <div className="border-t border-trust-100 bg-white p-3">
              <div className="flex gap-2">
                <input
                  id="assistant-input"
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask about any scheme..."
                  className="flex-1 rounded-xl border border-trust-200 bg-trust-50/50 px-3.5 py-2.5 text-sm text-trust-900 outline-none transition focus:border-trust-500 focus:ring-2 focus:ring-trust-500/20 placeholder:text-muted-foreground"
                />
                <button
                  id="assistant-send-btn"
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-trust-600 text-white shadow-md transition hover:bg-trust-700 disabled:opacity-40"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 text-center text-[10px] text-muted-foreground">
                Demo AI · Responses are pre-programmed for hackathon
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
