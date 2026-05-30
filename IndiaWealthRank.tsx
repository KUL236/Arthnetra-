'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// India income distribution data (approximate, annual household income in INR)
// Source: Various NSS/PLFS surveys, World Inequality Database approximations
const PERCENTILE_MAP = [
  { percentile: 10, income: 48000 },
  { percentile: 20, income: 72000 },
  { percentile: 30, income: 96000 },
  { percentile: 40, income: 126000 },
  { percentile: 50, income: 162000 },
  { percentile: 60, income: 210000 },
  { percentile: 70, income: 288000 },
  { percentile: 75, income: 360000 },
  { percentile: 80, income: 480000 },
  { percentile: 85, income: 660000 },
  { percentile: 90, income: 960000 },
  { percentile: 92, income: 1200000 },
  { percentile: 94, income: 1560000 },
  { percentile: 96, income: 2160000 },
  { percentile: 97, income: 3000000 },
  { percentile: 98, income: 4800000 },
  { percentile: 99, income: 9600000 },
  { percentile: 99.5, income: 18000000 },
  { percentile: 99.9, income: 60000000 },
];

function getPercentile(annualIncome: number): number {
  for (let i = 0; i < PERCENTILE_MAP.length; i++) {
    if (annualIncome <= PERCENTILE_MAP[i].income) {
      if (i === 0) return PERCENTILE_MAP[0].percentile * (annualIncome / PERCENTILE_MAP[0].income);
      const prev = PERCENTILE_MAP[i - 1];
      const curr = PERCENTILE_MAP[i];
      const ratio = (annualIncome - prev.income) / (curr.income - prev.income);
      return prev.percentile + ratio * (curr.percentile - prev.percentile);
    }
  }
  return 99.9;
}

function formatIncome(val: number) {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)} L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
  return `₹${val}`;
}

function getInsight(percentile: number, income: number): string {
  if (percentile >= 99) return "You are among India's ultra-wealthy top 1%. Your income exceeds 99% of all Indians.";
  if (percentile >= 95) return "You are in India's affluent top 5%. Very few Indians earn this much.";
  if (percentile >= 90) return "You are in the top 10% — officially part of India's upper-middle class.";
  if (percentile >= 80) return "You earn more than 4 in 5 Indians. You are in the upper-middle income bracket.";
  if (percentile >= 70) return "You are in India's middle class. Roughly 70 crore Indians earn less than you.";
  if (percentile >= 50) return "You are above the median Indian income. Half of all Indians earn less than you.";
  if (percentile >= 30) return "You are in the lower-middle income segment of India's population.";
  return "You are in the bottom 30% income group. Most Indians face similar financial constraints.";
}

// Logarithmic slider helpers
const MIN_LOG = Math.log(10000);
const MAX_LOG = Math.log(100000000);

function logToIncome(logVal: number): number {
  return Math.round(Math.exp(MIN_LOG + (logVal / 100) * (MAX_LOG - MIN_LOG)));
}
function incomeToLog(income: number): number {
  return ((Math.log(income) - MIN_LOG) / (MAX_LOG - MIN_LOG)) * 100;
}

const POPULATION_INDIA = 140; // crore

export function IndiaWealthRank() {
  const [sliderVal, setSliderVal] = useState(50); // log-scaled 0-100
  const [income, setIncome] = useState(logToIncome(50));
  const [isMonthly, setIsMonthly] = useState(true);
  const [animatedPct, setAnimatedPct] = useState(0);
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const annualIncome = isMonthly ? income * 12 : income;
  const percentile = getPercentile(annualIncome);
  const richerthan = Math.round(percentile);
  const peopleBelow = Math.round((percentile / 100) * POPULATION_INDIA * 10) / 10;

  useEffect(() => {
    if (animRef.current) clearTimeout(animRef.current);
    const target = richerthan;
    const start = animatedPct;
    const diff = target - start;
    const steps = 30;
    let i = 0;
    const tick = () => {
      i++;
      setAnimatedPct(Math.round(start + (diff * i) / steps));
      if (i < steps) animRef.current = setTimeout(tick, 20);
    };
    animRef.current = setTimeout(tick, 10);
    return () => { if (animRef.current) clearTimeout(animRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [richerthan]);

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setSliderVal(v);
    setIncome(logToIncome(v));
  };

  const fillPct = ((sliderVal) / 100) * 100;

  // Visual pyramid bars
  const pyramidBuckets = [
    { label: 'Top 1%', threshold: 99, color: '#F59E0B' },
    { label: 'Top 10%', threshold: 90, color: '#FB923C' },
    { label: 'Top 25%', threshold: 75, color: '#FBBF24' },
    { label: 'Top 50%', threshold: 50, color: '#D97706' },
    { label: 'Bottom 50%', threshold: 0, color: '#92400E' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-base p-5"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
          style={{ background: 'var(--accent-amber-glow)', color: 'var(--accent-amber)' }}
        >
          🇮🇳
        </div>
        <div>
          <h2 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            India Wealth Rank
          </h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Where do you stand among 140 crore Indians?
          </p>
        </div>
        {/* Monthly / Annual toggle */}
        <div
          className="ml-auto flex rounded-lg overflow-hidden text-xs font-mono"
          style={{ border: '1px solid var(--border-subtle)' }}
        >
          {['Monthly', 'Annual'].map(mode => (
            <button
              key={mode}
              onClick={() => setIsMonthly(mode === 'Monthly')}
              className="px-3 py-1.5 transition-all"
              style={{
                background: (isMonthly ? 'Monthly' : 'Annual') === mode ? 'var(--accent-amber)' : 'transparent',
                color: (isMonthly ? 'Monthly' : 'Annual') === mode ? '#000' : 'var(--text-secondary)',
              }}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Slider side */}
        <div>
          {/* Income display */}
          <div
            className="p-4 rounded-xl mb-5 text-center"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
          >
            <div className="text-xs font-mono mb-1" style={{ color: 'var(--text-muted)' }}>
              {isMonthly ? 'Monthly Income' : 'Annual Income'}
            </div>
            <div className="font-display font-black text-3xl" style={{ color: 'var(--accent-amber)' }}>
              {formatIncome(income)}
            </div>
            {isMonthly && (
              <div className="text-xs mt-1 font-mono" style={{ color: 'var(--text-muted)' }}>
                {formatIncome(income * 12)} / year
              </div>
            )}
          </div>

          {/* Slider */}
          <div className="mb-5">
            <input
              type="range"
              min={0}
              max={100}
              step={0.5}
              value={sliderVal}
              onChange={handleSlider}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, var(--accent-amber) 0%, var(--accent-amber) ${fillPct}%, var(--bg-elevated) ${fillPct}%, var(--bg-elevated) 100%)`,
              }}
            />
            <div className="flex justify-between text-xs font-mono mt-1" style={{ color: 'var(--text-muted)' }}>
              <span>₹10K/mo</span>
              <span>₹1 Cr/mo</span>
            </div>
          </div>

          {/* Quick presets */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            {[
              { label: 'Fresh grad', income: 25000 },
              { label: 'Mid-career', income: 75000 },
              { label: 'Senior pro', income: 250000 },
            ].map(p => (
              <button
                key={p.label}
                onClick={() => {
                  const newIncome = isMonthly ? p.income : p.income * 12;
                  setIncome(newIncome);
                  setSliderVal(incomeToLog(newIncome));
                }}
                className="py-2 rounded-lg text-xs transition-all hover:scale-105"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                }}
              >
                {p.label}
                <div className="text-xs font-mono" style={{ color: 'var(--accent-amber)' }}>
                  ₹{(p.income / 1000).toFixed(0)}K
                </div>
              </button>
            ))}
          </div>

          {/* Insight text */}
          <div
            className="p-3 rounded-xl text-xs leading-relaxed"
            style={{
              background: 'var(--accent-amber-glow)',
              border: '1px solid var(--accent-amber-border)',
              color: 'var(--text-secondary)',
            }}
          >
            {getInsight(percentile, annualIncome)}
          </div>
        </div>

        {/* Rank display side */}
        <div className="flex flex-col gap-4">
          {/* Big stat */}
          <motion.div
            className="text-center p-5 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(220,20,60,0.05) 100%)',
              border: '1px solid var(--accent-amber-border)',
            }}
          >
            <div className="text-xs font-mono mb-2" style={{ color: 'var(--text-muted)' }}>
              YOU ARE RICHER THAN
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={animatedPct}
                className="font-display font-black"
                style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', color: 'var(--accent-amber)', lineHeight: 1 }}
              >
                {animatedPct}%
              </motion.div>
            </AnimatePresence>
            <div className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
              of India · {peopleBelow} Crore people
            </div>
            <div
              className="mt-3 text-xs font-mono p-2 rounded-lg"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
            >
              📸 "I rank richer than {animatedPct}% of India — where do you rank?"
            </div>
          </motion.div>

          {/* Population pyramid visual */}
          <div className="space-y-1.5">
            <div className="text-xs font-mono mb-2" style={{ color: 'var(--text-muted)' }}>
              INDIA INCOME PYRAMID
            </div>
            {pyramidBuckets.map((bucket, i) => {
              const isActive = percentile >= bucket.threshold;
              const widths = [25, 45, 60, 75, 100];
              return (
                <div key={bucket.label} className="flex items-center gap-2">
                  <div
                    className="h-5 rounded transition-all duration-300 flex items-center px-2"
                    style={{
                      width: `${widths[i]}%`,
                      background: isActive ? bucket.color : 'var(--bg-elevated)',
                      opacity: isActive ? 1 : 0.4,
                      border: `1px solid ${isActive ? bucket.color : 'var(--border-subtle)'}`,
                    }}
                  >
                    <span className="text-xs font-mono" style={{ color: isActive ? '#000' : 'var(--text-muted)', fontWeight: 600 }}>
                      {bucket.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Top/bottom indicators */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-xl text-center" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Your percentile</div>
              <div className="font-mono font-bold text-lg" style={{ color: 'var(--accent-amber)' }}>
                {percentile >= 99 ? 'Top 1%' : `Top ${(100 - percentile).toFixed(1)}%`}
              </div>
            </div>
            <div className="p-3 rounded-xl text-center" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>People below you</div>
              <div className="font-mono font-bold text-lg" style={{ color: 'var(--accent-green)' }}>
                {peopleBelow} Cr
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
