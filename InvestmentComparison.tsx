'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Shield, TrendingUp, Zap, Coins } from 'lucide-react';

type InvestmentType = {
  id: string;
  icon: React.ReactNode;
  returnRange: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  liquidity: 'Low' | 'Medium' | 'High';
  taxBenefit: string;
  minInvestment: number;
  description: string;
  descriptionHi: string;
};

const INVESTMENTS: InvestmentType[] = [
  {
    id: 'fd',
    icon: <Shield size={18} />,
    returnRange: '6.5–7.5%',
    riskLevel: 'Low',
    liquidity: 'Medium',
    taxBenefit: 'Taxed at slab rate',
    minInvestment: 1000,
    description: 'Safest option. Fixed guaranteed returns. Great for emergency fund.',
    descriptionHi: 'सबसे सुरक्षित विकल्प। निश्चित गारंटीड रिटर्न। इमरजेंसी फंड के लिए बेहतरीन।',
  },
  {
    id: 'sip',
    icon: <TrendingUp size={18} />,
    returnRange: '10–15%',
    riskLevel: 'Medium',
    liquidity: 'High',
    taxBenefit: 'LTCG 10% above ₹1L',
    minInvestment: 500,
    description: 'Best for wealth creation over 5+ years. Rupee cost averaging benefits.',
    descriptionHi: '5+ साल में संपत्ति निर्माण के लिए सर्वश्रेष्ठ। रुपया लागत औसत का फायदा।',
  },
  {
    id: 'stocks',
    icon: <Zap size={18} />,
    returnRange: '12–20%',
    riskLevel: 'High',
    liquidity: 'High',
    taxBenefit: 'STCG 15%, LTCG 10%',
    minInvestment: 1,
    description: 'High risk, high reward. Requires research. Not for short-term.',
    descriptionHi: 'उच्च जोखिम, उच्च पुरस्कार। शोध जरूरी। अल्पकालिक के लिए नहीं।',
  },
  {
    id: 'gold',
    icon: <Coins size={18} />,
    returnRange: '8–12%',
    riskLevel: 'Low',
    liquidity: 'High',
    taxBenefit: 'LTCG 20% with indexation',
    minInvestment: 1,
    description: 'Inflation hedge. Good for portfolio diversification. Sovereign Gold Bonds best.',
    descriptionHi: 'मुद्रास्फीति से सुरक्षा। पोर्टफोलियो विविधीकरण के लिए अच्छा। SGB सबसे बेहतर।',
  },
  {
    id: 'ppf',
    icon: <Shield size={18} />,
    returnRange: '7.1%',
    riskLevel: 'Low',
    liquidity: 'Low',
    taxBenefit: 'Tax-free (EEE)',
    minInvestment: 500,
    description: '15-year lock-in but completely tax-free. Best for 80C + retirement.',
    descriptionHi: '15 साल का लॉक-इन लेकिन पूरी तरह टैक्स-फ्री। 80C और रिटायरमेंट के लिए सर्वश्रेष्ठ।',
  },
  {
    id: 'ipo',
    icon: <TrendingUp size={18} />,
    returnRange: 'Variable',
    riskLevel: 'High',
    liquidity: 'High',
    taxBenefit: 'STCG 15%, LTCG 10%',
    minInvestment: 15000,
    description: 'Can give 20–100% listing gains but also loss. Apply only in strong IPOs.',
    descriptionHi: '20-100% लिस्टिंग गेन हो सकता है लेकिन नुकसान भी। केवल मजबूत IPO में आवेदन करें।',
  },
];

const RISK_COLORS: Record<string, string> = {
  Low: 'var(--accent-green)',
  Medium: '#F59E0B',
  High: 'var(--accent-red)',
};

const LIQUIDITY_LABELS: Record<string, string> = {
  Low: '🔒',
  Medium: '⚖️',
  High: '💧',
};

export function InvestmentComparison() {
  const { t, i18n } = useTranslation();
  const [selected, setSelected] = useState<string[]>(['fd', 'sip', 'gold']);
  const [amount, setAmount] = useState(5000);
  const isHindi = i18n.language === 'hi';

  const toggleSelect = (id: string) => {
    if (selected.includes(id)) {
      if (selected.length > 1) setSelected(selected.filter((s) => s !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const selectedInvestments = INVESTMENTS.filter((inv) => selected.includes(inv.id));

  function calcReturns(inv: InvestmentType, yrs: number) {
    const midReturn = inv.returnRange.includes('–')
      ? (parseFloat(inv.returnRange.split('–')[0]) + parseFloat(inv.returnRange.split('–')[1])) / 2 / 100
      : parseFloat(inv.returnRange) / 100;
    if (isNaN(midReturn)) return amount * yrs * 12;
    return Math.round(amount * 12 * (((Math.pow(1 + midReturn / 12, yrs * 12)) - 1) / (midReturn / 12)));
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-base p-5"
    >
      <div className="mb-4">
        <h2 className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
          {t('invest.title')}
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          {t('invest.subtitle')}
        </p>
      </div>

      {/* Amount slider */}
      <div className="mb-5 p-3 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{t('invest.amount')}</span>
          <span className="font-mono font-bold text-sm" style={{ color: 'var(--accent-amber)' }}>
            ₹{amount.toLocaleString('en-IN')}/mo
          </span>
        </div>
        <input
          type="range" min={500} max={100000} step={500} value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{ background: `linear-gradient(to right, var(--accent-amber) ${((amount-500)/(99500))*100}%, var(--bg-card) ${((amount-500)/(99500))*100}%)` }}
        />
      </div>

      {/* Select investments */}
      <div className="flex flex-wrap gap-2 mb-5">
        {INVESTMENTS.map((inv) => (
          <button
            key={inv.id}
            onClick={() => toggleSelect(inv.id)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105"
            style={{
              background: selected.includes(inv.id) ? 'var(--accent-amber-glow)' : 'var(--bg-elevated)',
              color: selected.includes(inv.id) ? 'var(--accent-amber)' : 'var(--text-muted)',
              border: `1px solid ${selected.includes(inv.id) ? 'var(--accent-amber-border)' : 'var(--border-subtle)'}`,
            }}
          >
            {t(`invest.${inv.id}`)}
          </button>
        ))}
      </div>

      {/* Comparison cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {selectedInvestments.map((inv, i) => (
          <motion.div
            key={inv.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="p-4 rounded-xl"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'var(--accent-amber-glow)', color: 'var(--accent-amber)' }}
                >
                  {inv.icon}
                </div>
                <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  {t(`invest.${inv.id}`)}
                </span>
              </div>
              <span
                className="text-xs font-mono font-bold"
                style={{ color: RISK_COLORS[inv.riskLevel] }}
              >
                {inv.riskLevel}
              </span>
            </div>

            <div className="space-y-2 mb-3">
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--text-muted)' }}>Returns</span>
                <span className="font-mono font-semibold" style={{ color: 'var(--accent-amber)' }}>{inv.returnRange}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--text-muted)' }}>Liquidity</span>
                <span>{LIQUIDITY_LABELS[inv.liquidity]} {inv.liquidity}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--text-muted)' }}>Min.</span>
                <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>₹{inv.minInvestment}</span>
              </div>
            </div>

            {/* Projected values */}
            <div className="grid grid-cols-3 gap-1 mb-3">
              {[5, 10, 20].map((y) => (
                <div key={y} className="text-center p-1.5 rounded-lg" style={{ background: 'var(--bg-card)' }}>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{y}yr</p>
                  <p className="text-xs font-mono font-bold" style={{ color: 'var(--accent-green)' }}>
                    {calcReturns(inv, y) >= 10000000
                      ? `${(calcReturns(inv, y) / 10000000).toFixed(1)}Cr`
                      : calcReturns(inv, y) >= 100000
                      ? `${(calcReturns(inv, y) / 100000).toFixed(1)}L`
                      : `${(calcReturns(inv, y) / 1000).toFixed(0)}K`}
                  </p>
                </div>
              ))}
            </div>

            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {isHindi ? inv.descriptionHi : inv.description}
            </p>

            <div
              className="mt-2 text-xs p-2 rounded-lg"
              style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}
            >
              📊 {inv.taxBenefit}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
