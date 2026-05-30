'use client';
import { Navbar } from '@/components/layout/Navbar';
import { AIChat } from '@/components/dashboard/AIChat';
import { motion } from 'framer-motion';
import { Sparkles, Brain, Globe, Shield } from 'lucide-react';
import '@/i18n/config';

const FEATURES = [
  { icon: Brain, title: 'Investment Guidance', titleHi: 'निवेश मार्गदर्शन', desc: 'Personalized advice on SIP, FD, stocks, gold and more', descHi: 'SIP, FD, स्टॉक, सोने पर व्यक्तिगत सलाह' },
  { icon: Globe, title: 'Hindi & English', titleHi: 'हिंदी और अंग्रेज़ी', desc: 'Ask in any language, get clear explanations', descHi: 'किसी भी भाषा में पूछें, स्पष्ट जवाब पाएं' },
  { icon: Shield, title: 'Safe & Unbiased', titleHi: 'सुरक्षित और निष्पक्ष', desc: 'Educational guidance only — not financial advice', descHi: 'केवल शैक्षणिक मार्गदर्शन — वित्तीय सलाह नहीं' },
  { icon: Sparkles, title: 'Powered by Groq AI', titleHi: 'Groq AI द्वारा संचालित', desc: 'Ultra-fast LLaMA 3 70B intelligence', descHi: 'अति-तीव्र LLaMA 3 70B बुद्धिमत्ता' },
];

const SAMPLE_QA = [
  { q: 'Where should I invest ₹5000 monthly?', a: 'For ₹5000/month, a good split: ₹3000 in ELSS SIP (tax-saving + growth), ₹1000 in a liquid fund (emergency), ₹1000 in Sovereign Gold Bonds. Adjust based on your goal horizon.' },
  { q: 'मुझे ₹5000 हर महीने कहाँ निवेश करना चाहिए?', a: '₹5000 प्रति माह के लिए: ₹3000 ELSS SIP में (टैक्स बचत + विकास), ₹1000 लिक्विड फंड में (इमरजेंसी), ₹1000 सॉवरेन गोल्ड बॉन्ड में। अपने लक्ष्य के अनुसार समायोजित करें।' },
  { q: 'Is FD safer than SIP?', a: 'FD offers guaranteed returns (6.5–7.5%) with zero market risk — ideal for short-term goals. SIP in mutual funds gives higher long-term returns (10–15%) but with market volatility. Choose FD for safety, SIP for wealth creation.' },
];

export default function AIMentorPage() {
  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-5"
            style={{ borderColor: 'var(--accent-amber-border)', background: 'var(--accent-amber-glow)', color: 'var(--accent-amber)' }}
          >
            <Sparkles size={14} />
            <span className="text-xs font-mono font-semibold">GROQ LLAMA 3 70B • BILINGUAL</span>
          </div>
          <h1 className="font-display font-black mb-3" style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', color: 'var(--text-primary)' }}>
            AI <span className="text-gradient-amber">Financial Mentor</span>
          </h1>
          <p className="max-w-xl mx-auto text-sm" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Your intelligent finance guide — in Hindi or English. Ask about investments, savings, markets, tax, and more.
          </p>
        </motion.div>

        {/* Feature pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="p-3 rounded-xl text-center"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
            >
              <f.icon size={20} style={{ color: 'var(--accent-amber)', margin: '0 auto 6px' }} />
              <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{f.title}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Chat */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-10">
          <AIChat />
        </motion.div>

        {/* Sample Q&A */}
        <div>
          <h2 className="font-display font-bold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>
            Sample Conversations
          </h2>
          <div className="space-y-4">
            {SAMPLE_QA.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="rounded-xl overflow-hidden"
                style={{ border: '1px solid var(--border-subtle)' }}
              >
                <div className="px-4 py-3" style={{ background: 'var(--accent-amber-glow)' }}>
                  <p className="text-sm font-semibold" style={{ color: 'var(--accent-amber)' }}>Q: {item.q}</p>
                </div>
                <div className="px-4 py-3" style={{ background: 'var(--bg-card)' }}>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>💡 {item.a}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs mt-8" style={{ color: 'var(--text-muted)' }}>
          ⚠️ AI responses are for educational purposes only. Consult a SEBI-registered advisor before investing.
        </p>
      </div>
    </div>
  );
}
