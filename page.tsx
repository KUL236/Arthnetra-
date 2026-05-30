'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronRight } from 'lucide-react';
import '@/i18n/config';

type Lesson = { title: string; titleHi: string; content: string; contentHi: string; emoji: string };
type Module = { id: string; label: string; labelHi: string; color: string; lessons: Lesson[] };

const MODULES: Module[] = [
  {
    id: 'beginner',
    label: 'Beginner',
    labelHi: 'शुरुआती',
    color: '#22C55E',
    lessons: [
      {
        emoji: '💰',
        title: 'What is Investing?',
        titleHi: 'निवेश क्या है?',
        content: `Investing means putting your money to work so it grows over time. Instead of keeping money idle in a savings account earning 3-4%, you invest it to potentially earn 10-15% annually.\n\n**Key Principle:** Money has a time value. ₹1,000 today is worth more than ₹1,000 a year later due to inflation (~6%). Investing helps you beat inflation and build real wealth.\n\n**First Step:** Build an emergency fund (3-6 months expenses) in a liquid fund or FD before investing in markets.`,
        contentHi: `निवेश का मतलब है अपने पैसे को काम पर लगाना ताकि वह समय के साथ बढ़े। 3-4% बचत खाते की जगह, निवेश से 10-15% सालाना मिल सकता है।\n\n**मुख्य सिद्धांत:** पैसे का समय मूल्य होता है। आज का ₹1,000 एक साल बाद ₹1,000 से ज़्यादा मूल्यवान है। निवेश मुद्रास्फीति को मात देने में मदद करता है।\n\n**पहला कदम:** बाज़ार में निवेश से पहले लिक्विड फंड या FD में 3-6 महीने का इमरजेंसी फंड बनाएं।`,
      },
      {
        emoji: '📊',
        title: 'Mutual Funds Explained',
        titleHi: 'म्यूचुअल फंड समझें',
        content: `A mutual fund pools money from thousands of investors and invests in stocks, bonds, or both. A professional fund manager makes the investment decisions.\n\n**Types:**\n• Equity Funds — invest in stocks (high risk, high return)\n• Debt Funds — invest in bonds (low risk, stable return)\n• Hybrid Funds — mix of both\n• ELSS — equity fund with 80C tax benefit\n\n**SIP (Systematic Investment Plan):** Invest a fixed amount monthly. Benefits from rupee-cost averaging — you buy more units when prices are low.`,
        contentHi: `म्यूचुअल फंड हजारों निवेशकों का पैसा एकत्रित करके स्टॉक, बॉन्ड या दोनों में लगाता है।\n\n**प्रकार:**\n• इक्विटी फंड — शेयरों में निवेश (उच्च जोखिम, उच्च रिटर्न)\n• डेट फंड — बॉन्ड में (कम जोखिम, स्थिर रिटर्न)\n• हाइब्रिड फंड — दोनों का मिश्रण\n• ELSS — 80C टैक्स लाभ के साथ इक्विटी फंड\n\n**SIP:** हर महीने एक निश्चित राशि निवेश करें। कम कीमत पर अधिक यूनिट मिलती हैं।`,
      },
      {
        emoji: '🏦',
        title: 'Fixed Deposits (FD)',
        titleHi: 'फिक्स्ड डिपॉज़िट',
        content: `FD is the safest investment in India — guaranteed by DICGC up to ₹5 lakh. You deposit money for a fixed term (7 days to 10 years) at a fixed interest rate.\n\n**Current rates (2024):** 6.5% to 8% depending on bank and tenure.\n\n**Tax:** Interest is fully taxable at your income slab rate. TDS deducted if interest > ₹40,000/year.\n\n**Best for:** Emergency fund, short-term goals, senior citizens (extra 0.5% rate), capital preservation.`,
        contentHi: `FD भारत में सबसे सुरक्षित निवेश है — DICGC द्वारा ₹5 लाख तक गारंटीड। एक निश्चित अवधि के लिए एक निश्चित ब्याज दर पर पैसा जमा करें।\n\n**वर्तमान दरें:** बैंक और अवधि के अनुसार 6.5% से 8%।\n\n**कर:** ब्याज पूरी तरह आपके टैक्स स्लैब पर कर योग्य है।\n\n**सर्वश्रेष्ठ:** इमरजेंसी फंड, अल्पकालिक लक्ष्य, वरिष्ठ नागरिक।`,
      },
    ],
  },
  {
    id: 'intermediate',
    label: 'Intermediate',
    labelHi: 'मध्यम',
    color: '#F59E0B',
    lessons: [
      {
        emoji: '📈',
        title: 'How Stock Market Works',
        titleHi: 'शेयर बाज़ार कैसे काम करता है?',
        content: `When you buy a stock, you own a small piece of a company. BSE (Bombay Stock Exchange) and NSE (National Stock Exchange) are India's main exchanges.\n\n**NIFTY 50:** Index of 50 largest companies on NSE. Sensex is the 30-stock index on BSE.\n\n**How to invest:** Open a Demat + Trading account with SEBI-registered broker (Zerodha, Groww, Angel One). Link your bank, complete KYC, and start investing.\n\n**Key metrics:** P/E ratio, EPS, Dividend yield, Market Cap, ROE.`,
        contentHi: `जब आप शेयर खरीदते हैं, तो आप किसी कंपनी के एक छोटे हिस्से के मालिक बन जाते हैं।\n\n**NIFTY 50:** NSE की 50 सबसे बड़ी कंपनियों का सूचकांक। Sensex BSE पर 30 शेयरों का सूचकांक।\n\n**निवेश कैसे करें:** SEBI-पंजीकृत ब्रोकर (Zerodha, Groww, Angel One) के साथ डीमैट + ट्रेडिंग खाता खोलें।\n\n**मुख्य मेट्रिक्स:** P/E अनुपात, EPS, डिविडेंड यील्ड, मार्केट कैप, ROE।`,
      },
      {
        emoji: '🥇',
        title: 'Gold as Investment',
        titleHi: 'सोना निवेश के रूप में',
        content: `Gold is a classic inflation hedge. Options to invest in gold:\n\n1. **Physical Gold** — jewellery, coins. High making charges, storage risk.\n2. **Gold ETF** — traded on exchange like stock. Low cost, no storage risk.\n3. **Sovereign Gold Bonds (SGB)** — RBI-backed. 2.5% annual interest + gold price appreciation. Best option!\n4. **Digital Gold** — on apps. Convenient but no regulatory backing.\n\n**Ideal allocation:** 10–15% of portfolio. Gold performs well during recessions and geopolitical uncertainty.`,
        contentHi: `सोना क्लासिक मुद्रास्फीति बचाव है। सोने में निवेश के विकल्प:\n\n1. **भौतिक सोना** — आभूषण, सिक्के। उच्च मेकिंग चार्ज, भंडारण जोखिम।\n2. **Gold ETF** — शेयर की तरह एक्सचेंज पर कारोबार। कम लागत।\n3. **सॉवरेन गोल्ड बॉन्ड (SGB)** — RBI-समर्थित। 2.5% सालाना ब्याज + सोने की कीमत वृद्धि। सर्वश्रेष्ठ!\n4. **डिजिटल सोना** — ऐप्स पर। सुविधाजनक।\n\n**आदर्श आवंटन:** पोर्टफोलियो का 10-15%।`,
      },
      {
        emoji: '🏛️',
        title: 'Tax Planning 101',
        titleHi: 'टैक्स प्लानिंग 101',
        content: `**Section 80C (₹1.5L limit):** ELSS, PPF, NPS, LIC, Home Loan Principal, EPF, NSC, ULIP\n\n**Section 80D:** Health insurance premium — ₹25,000 self, ₹50,000 senior citizen parents.\n\n**Capital Gains:**\n• STCG (held < 1 year): 15% tax on equity\n• LTCG (held > 1 year): 10% above ₹1L profit on equity\n• Debt: As per income slab\n\n**HRA, LTA, Standard Deduction:** ₹50,000 standard deduction for salaried employees.`,
        contentHi: `**धारा 80C (₹1.5L सीमा):** ELSS, PPF, NPS, LIC, होम लोन मूलधन, EPF\n\n**धारा 80D:** स्वास्थ्य बीमा प्रीमियम — स्वयं ₹25,000, वरिष्ठ नागरिक माता-पिता ₹50,000।\n\n**पूंजीगत लाभ:**\n• STCG (1 साल से कम): इक्विटी पर 15%\n• LTCG (1 साल से अधिक): इक्विटी पर ₹1L से ऊपर 10%\n\n**वेतनभोगी:** ₹50,000 मानक कटौती।`,
      },
    ],
  },
  {
    id: 'advanced',
    label: 'Advanced',
    labelHi: 'उन्नत',
    color: '#8B5CF6',
    lessons: [
      {
        emoji: '🔍',
        title: 'Fundamental Analysis',
        titleHi: 'मौलिक विश्लेषण',
        content: `Fundamental analysis evaluates a company's intrinsic value by examining financial statements.\n\n**Key Ratios:**\n• **P/E Ratio:** Price ÷ EPS. Lower P/E vs sector = potentially undervalued.\n• **ROE:** Net Profit ÷ Equity. >15% is good.\n• **Debt-to-Equity:** Lower is safer. <1 preferred.\n• **Free Cash Flow:** Profit that's actually cash, not accounting.\n\n**Process:** Understand business → Check financials → Value stock → Compare to market price → Invest with margin of safety.`,
        contentHi: `मौलिक विश्लेषण वित्तीय विवरणों की जांच करके किसी कंपनी के आंतरिक मूल्य का मूल्यांकन करता है।\n\n**मुख्य अनुपात:**\n• **P/E अनुपात:** कम P/E = संभावित अंडरवैल्यूड।\n• **ROE:** >15% अच्छा है।\n• **ऋण-इक्विटी:** <1 पसंदीदा।\n• **फ्री कैश फ्लो:** वास्तविक नकद लाभ।`,
      },
      {
        emoji: '📉',
        title: 'Technical Analysis Basics',
        titleHi: 'तकनीकी विश्लेषण',
        content: `Technical analysis uses price charts and indicators to predict future price movements.\n\n**Key Indicators:**\n• **Moving Average (MA):** 50-day and 200-day MA. Bullish when price > MA.\n• **RSI (Relative Strength Index):** >70 = overbought, <30 = oversold.\n• **MACD:** Trend following momentum indicator.\n• **Support & Resistance:** Price levels where stock tends to bounce or fall.\n\n**Candlestick Patterns:** Doji, Hammer, Engulfing — tell the story of buyer vs seller battle.`,
        contentHi: `तकनीकी विश्लेषण भविष्य की कीमतों की भविष्यवाणी के लिए चार्ट और संकेतकों का उपयोग करता है।\n\n**मुख्य संकेतक:**\n• **मूविंग एवरेज:** 50-दिन और 200-दिन MA।\n• **RSI:** >70 = ओवरबॉट, <30 = ओवरसोल्ड।\n• **MACD:** ट्रेंड फॉलोइंग मोमेंटम संकेतक।\n• **सपोर्ट और रेजिस्टेंस:** प्रमुख मूल्य स्तर।`,
      },
      {
        emoji: '⚡',
        title: 'IPO Investing Strategy',
        titleHi: 'IPO निवेश रणनीति',
        content: `An IPO (Initial Public Offering) is when a company first sells shares to the public. India sees 100+ IPOs annually.\n\n**How to Apply:** Use ASBA (Application Supported by Blocked Amount) through net banking or broker app. UPI payment also accepted.\n\n**Evaluation checklist:**\n✓ Business model and promoter quality\n✓ Revenue and profit growth (3-year trend)\n✓ P/E vs industry peers\n✓ GMP (Grey Market Premium) — market sentiment\n✓ Listing category (SME vs Mainboard)\n\n**Risk:** Oversubscribed IPOs often list at premium but may fall. Apply only in fundamentally strong IPOs.`,
        contentHi: `IPO तब होता है जब कोई कंपनी पहली बार जनता को शेयर बेचती है।\n\n**आवेदन कैसे करें:** नेट बैंकिंग या ब्रोकर ऐप के माध्यम से ASBA का उपयोग करें।\n\n**मूल्यांकन चेकलिस्ट:**\n✓ व्यापार मॉडल और प्रमोटर गुणवत्ता\n✓ राजस्व और लाभ वृद्धि\n✓ उद्योग समकक्षों की तुलना में P/E\n✓ GMP (ग्रे मार्केट प्रीमियम)\n\n**जोखिम:** केवल मौलिक रूप से मजबूत IPO में आवेदन करें।`,
      },
    ],
  },
];

function LessonCard({ lesson, isHindi }: { lesson: Lesson; isHindi: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rounded-xl overflow-hidden transition-all"
      style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-card)' }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left transition-colors hover:bg-opacity-50"
        style={{ background: open ? 'var(--accent-amber-glow)' : 'transparent' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{lesson.emoji}</span>
          <span className="font-semibold text-sm" style={{ color: open ? 'var(--accent-amber)' : 'var(--text-primary)' }}>
            {isHindi ? lesson.titleHi : lesson.title}
          </span>
        </div>
        {open ? <ChevronDown size={16} style={{ color: 'var(--accent-amber)' }} /> : <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-secondary)', borderTop: '1px solid var(--border-subtle)' }}>
              {(isHindi ? lesson.contentHi : lesson.content).split('**').map((part, i) =>
                i % 2 === 1
                  ? <strong key={i} style={{ color: 'var(--text-primary)' }}>{part}</strong>
                  : <span key={i}>{part}</span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LearnPage() {
  const { t, i18n } = useTranslation();
  const isHindi = i18n.language === 'hi';
  const [activeModule, setActiveModule] = useState('beginner');
  const currentModule = MODULES.find((m) => m.id === activeModule)!;

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display font-black text-3xl mb-2" style={{ color: 'var(--text-primary)' }}>
            {t('learn.title')}
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('learn.subtitle')}</p>
        </motion.div>

        {/* Module Tabs */}
        <div className="flex gap-2 mb-6">
          {MODULES.map((mod) => (
            <button
              key={mod.id}
              onClick={() => setActiveModule(mod.id)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: activeModule === mod.id ? mod.color + '22' : 'var(--bg-card)',
                color: activeModule === mod.id ? mod.color : 'var(--text-muted)',
                border: `1px solid ${activeModule === mod.id ? mod.color + '55' : 'var(--border-subtle)'}`,
              }}
            >
              {isHindi ? mod.labelHi : mod.label}
            </button>
          ))}
        </div>

        {/* Lessons */}
        <div className="space-y-3">
          {currentModule.lessons.map((lesson, i) => (
            <motion.div
              key={lesson.title}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <LessonCard lesson={lesson} isHindi={isHindi} />
            </motion.div>
          ))}
        </div>

        {/* Progress hint */}
        <div
          className="mt-8 p-4 rounded-2xl text-center"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
        >
          <p className="text-sm font-semibold mb-1" style={{ color: 'var(--accent-amber)' }}>
            {isHindi ? '📚 अपनी सीख जारी रखें' : '📚 Continue Learning'}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {isHindi
              ? 'AI सलाहकार से व्यक्तिगत प्रश्न पूछें और वेल्थ सिमुलेटर से अपने भविष्य की गणना करें।'
              : 'Ask the AI Mentor personalized questions and use the Wealth Simulator to plan your future.'}
          </p>
        </div>
      </div>
    </div>
  );
}
