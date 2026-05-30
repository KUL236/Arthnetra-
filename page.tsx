'use client';
import { Navbar } from '@/components/layout/Navbar';
import { WealthSimulator } from '@/components/dashboard/WealthSimulator';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import '@/i18n/config';

const PRESETS = [
  { label: 'Student SIP', labelHi: 'छात्र SIP', principal: 0, monthly: 500, rate: 12, years: 10, desc: 'Starting small at 20' },
  { label: 'Salary Earner', labelHi: 'वेतनभोगी', principal: 50000, monthly: 5000, rate: 12, years: 20, desc: '₹5K/mo for 20 years' },
  { label: 'Aggressive', labelHi: 'आक्रामक', principal: 200000, monthly: 20000, rate: 15, years: 15, desc: 'High risk, high reward' },
  { label: 'Conservative FD', labelHi: 'रूढ़िवादी FD', principal: 100000, monthly: 3000, rate: 7, years: 10, desc: 'Safe FD-like returns' },
  { label: 'Retirement', labelHi: 'सेवानिवृत्ति', principal: 500000, monthly: 10000, rate: 12, years: 25, desc: '25-year wealth plan' },
  { label: 'Child Education', labelHi: 'बच्चे की शिक्षा', principal: 100000, monthly: 8000, rate: 13, years: 18, desc: 'Plan for college fund' },
];

export default function SimulatorPage() {
  const { t, i18n } = useTranslation();
  const isHindi = i18n.language === 'hi';

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="font-display font-black text-3xl mb-2" style={{ color: 'var(--text-primary)' }}>
            {t('simulator.title')}
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {t('simulator.subtitle')} — {isHindi ? 'चक्रवृद्धि ब्याज की शक्ति देखें' : 'Visualize the power of compounding'}
          </p>
        </motion.div>

        {/* Preset Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-6">
          {PRESETS.map((p, i) => (
            <motion.div
              key={p.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06 }}
              className="p-3 rounded-xl cursor-pointer transition-all hover:scale-105 text-center"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
            >
              <p className="text-xs font-bold mb-1" style={{ color: 'var(--accent-amber)' }}>
                {isHindi ? p.labelHi : p.label}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{p.desc}</p>
            </motion.div>
          ))}
        </div>

        <WealthSimulator />

        {/* Educational blurb */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-5 rounded-2xl"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
        >
          <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--accent-amber)' }}>
            💡 {isHindi ? 'चक्रवृद्धि ब्याज के बारे में जानें' : 'About Compounding'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            <p><strong style={{ color: 'var(--text-primary)' }}>Rule of 72:</strong> {isHindi ? 'अपने पैसे को दोगुना होने के साल जानने के लिए 72 को ब्याज दर से भाग दें। 12% पर = 6 साल।' : 'Divide 72 by your return rate to find years to double money. At 12% = 6 years.'}</p>
            <p><strong style={{ color: 'var(--text-primary)' }}>{isHindi ? 'जल्दी शुरू करें' : 'Start Early:'}:</strong> {isHindi ? '₹500/माह 20 साल में ₹50L बन सकता है। देर से शुरू करने पर ₹2000/माह चाहिए।' : '₹500/month for 20 years = ₹50L. Starting late needs ₹2000/month for same result.'}</p>
            <p><strong style={{ color: 'var(--text-primary)' }}>{isHindi ? 'मुद्रास्फीति' : 'Inflation Impact'}:</strong> {isHindi ? 'आज का ₹1L, 10 साल बाद 6% मुद्रास्फीति पर केवल ₹55,839 के बराबर होगा।' : 'Today\'s ₹1L equals only ₹55,839 in 10 years at 6% inflation. Invest to stay ahead.'}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
