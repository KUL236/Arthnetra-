'use client';
import { Navbar } from '@/components/layout/Navbar';
import { InvestmentComparison } from '@/components/dashboard/InvestmentComparison';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import '@/i18n/config';

const RISK_PROFILES = [
  { id: 'conservative', label: 'Conservative', labelHi: 'रूढ़िवादी', icon: '🛡️', color: '#22C55E', desc: 'Capital preservation. FD, PPF, Bonds.', descHi: 'पूंजी सुरक्षा। FD, PPF, बॉन्ड।' },
  { id: 'moderate', label: 'Moderate', labelHi: 'मध्यम', icon: '⚖️', color: '#F59E0B', desc: 'Balanced growth. Hybrid funds, Gold.', descHi: 'संतुलित विकास। हाइब्रिड फंड, सोना।' },
  { id: 'aggressive', label: 'Aggressive', labelHi: 'आक्रामक', icon: '🚀', color: '#EF4444', desc: 'Maximum growth. Equity, Small-cap.', descHi: 'अधिकतम विकास। इक्विटी, स्मॉल-कैप।' },
];

export default function InvestPage() {
  const { t, i18n } = useTranslation();
  const isHindi = i18n.language === 'hi';

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="font-display font-black text-3xl mb-2" style={{ color: 'var(--text-primary)' }}>
            {t('invest.title')}
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('invest.subtitle')}</p>
        </motion.div>

        {/* Risk Profile Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {RISK_PROFILES.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-4 rounded-2xl cursor-pointer transition-all hover:scale-[1.02]"
              style={{ background: 'var(--bg-card)', border: `1px solid ${p.color}33` }}
            >
              <div className="text-2xl mb-2">{p.icon}</div>
              <h3 className="font-bold text-sm mb-1" style={{ color: p.color }}>
                {isHindi ? p.labelHi : p.label}
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {isHindi ? p.descHi : p.desc}
              </p>
            </motion.div>
          ))}
        </div>

        <InvestmentComparison />

        {/* Quick tips */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {[
            {
              title: isHindi ? '80C टैक्स बचत' : '80C Tax Saving',
              content: isHindi
                ? 'ELSS, PPF, NPS, LIC प्रीमियम — ये सभी ₹1.5 लाख तक 80C कटौती देते हैं। ELSS सबसे कम लॉक-इन (3 साल) के साथ सबसे अधिक रिटर्न देता है।'
                : 'ELSS, PPF, NPS, LIC Premium — all give 80C deduction up to ₹1.5L. ELSS gives best returns with shortest lock-in (3 yrs).',
              icon: '🏛️',
            },
            {
              title: isHindi ? 'SIP vs एकमुश्त' : 'SIP vs Lump Sum',
              content: isHindi
                ? 'SIP बाज़ार की अस्थिरता को औसत करता है और अनुशासन बनाता है। एकमुश्त बाज़ार में गिरावट पर बेहतर है। शुरुआती लोगों के लिए SIP हमेशा बेहतर।'
                : 'SIP averages market volatility and builds discipline. Lump sum is better during market dips. SIP is always better for beginners.',
              icon: '📈',
            },
          ].map((tip) => (
            <div key={tip.title} className="p-4 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{tip.icon}</span>
                <h4 className="font-bold text-sm" style={{ color: 'var(--accent-amber)' }}>{tip.title}</h4>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{tip.content}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
