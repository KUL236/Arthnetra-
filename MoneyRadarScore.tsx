'use client';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

const DIMENSIONS = [
  {
    key: 'savings',
    label: 'Savings',
    icon: '🏦',
    question: 'What % of income do you save monthly?',
    options: [
      { label: 'Less than 5%', score: 15 },
      { label: '5–10%', score: 35 },
      { label: '10–20%', score: 65 },
      { label: '20–30%', score: 85 },
      { label: 'Above 30%', score: 100 },
    ],
    color: '#F59E0B',
  },
  {
    key: 'debt',
    label: 'Debt',
    icon: '💳',
    question: 'What is your EMI-to-income ratio?',
    options: [
      { label: 'No EMIs', score: 100 },
      { label: 'Under 20%', score: 80 },
      { label: '20–40%', score: 55 },
      { label: '40–60%', score: 30 },
      { label: 'Above 60%', score: 10 },
    ],
    color: '#DC143C',
  },
  {
    key: 'investments',
    label: 'Investments',
    icon: '📈',
    question: 'Do you have a diversified investment portfolio?',
    options: [
      { label: 'No investments', score: 10 },
      { label: 'Only FDs/savings', score: 30 },
      { label: 'MF/SIPs only', score: 60 },
      { label: 'MF + Stocks', score: 80 },
      { label: 'MF + Stocks + Real estate', score: 100 },
    ],
    color: '#22C55E',
  },
  {
    key: 'insurance',
    label: 'Insurance',
    icon: '🛡️',
    question: 'What insurance coverage do you have?',
    options: [
      { label: 'No insurance', score: 5 },
      { label: 'Only employer cover', score: 30 },
      { label: 'Health insurance only', score: 55 },
      { label: 'Health + Term life', score: 80 },
      { label: 'Health + Term + Critical illness', score: 100 },
    ],
    color: '#60A5FA',
  },
  {
    key: 'emergency',
    label: 'Emergency Fund',
    icon: '🚨',
    question: 'How many months of expenses as emergency fund?',
    options: [
      { label: 'None', score: 5 },
      { label: '1 month', score: 25 },
      { label: '2–3 months', score: 55 },
      { label: '4–6 months', score: 80 },
      { label: '6+ months', score: 100 },
    ],
    color: '#A78BFA',
  },
  {
    key: 'tax',
    label: 'Tax Planning',
    icon: '📋',
    question: 'How proactive are you with tax planning?',
    options: [
      { label: 'No planning at all', score: 10 },
      { label: 'Only 80C basics', score: 35 },
      { label: '80C + 80D', score: 60 },
      { label: 'Multiple deductions used', score: 80 },
      { label: 'ELSS + NPS + HRA optimised', score: 100 },
    ],
    color: '#FB923C',
  },
];

function getGrade(score: number) {
  if (score >= 85) return { grade: 'A+', label: 'Excellent', color: '#22C55E' };
  if (score >= 70) return { grade: 'A', label: 'Very Good', color: '#84CC16' };
  if (score >= 55) return { grade: 'B', label: 'Good', color: '#F59E0B' };
  if (score >= 40) return { grade: 'C', label: 'Needs Work', color: '#FB923C' };
  return { grade: 'D', label: 'Critical', color: '#DC143C' };
}

const CustomRadarTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: { subject: string; score: number } }[] }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="glass-card px-3 py-2 text-xs font-mono" style={{ border: '1px solid var(--border-accent)' }}>
      <p style={{ color: 'var(--accent-amber)' }}>{d.subject}</p>
      <p style={{ color: 'var(--text-primary)' }}>{d.score}/100</p>
    </div>
  );
};

export function MoneyRadarScore() {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [step, setStep] = useState(0); // 0 = intro, 1-6 = questions, 7 = result
  const [revealed, setRevealed] = useState(false);

  const totalScore = Object.keys(scores).length === 6
    ? Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 6)
    : 0;

  const radarData = DIMENSIONS.map(d => ({
    subject: d.label,
    score: scores[d.key] ?? 0,
    fullMark: 100,
  }));

  const handleAnswer = useCallback((score: number) => {
    const dim = DIMENSIONS[step - 1];
    setScores(prev => ({ ...prev, [dim.key]: score }));
    if (step < 6) {
      setStep(s => s + 1);
    } else {
      setStep(7);
      setTimeout(() => setRevealed(true), 400);
    }
  }, [step]);

  const reset = () => {
    setScores({});
    setStep(0);
    setRevealed(false);
  };

  const currentDim = step >= 1 && step <= 6 ? DIMENSIONS[step - 1] : null;
  const grade = totalScore > 0 ? getGrade(totalScore) : null;

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
          🎯
        </div>
        <div>
          <h2 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            Money Radar Score
          </h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Your 360° financial health · Share like a personality test
          </p>
        </div>
        {step === 7 && (
          <button
            onClick={reset}
            className="ml-auto text-xs px-3 py-1.5 rounded-lg transition-all hover:scale-105"
            style={{ border: '1px solid var(--border-accent)', color: 'var(--text-secondary)' }}
          >
            Retake
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* Intro */}
        {step === 0 && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center py-6"
          >
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="font-display font-bold text-xl mb-2" style={{ color: 'var(--text-primary)' }}>
              Discover Your Financial Score
            </h3>
            <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: 'var(--text-secondary)' }}>
              6 quick questions. Get a beautiful radar chart of your financial health across savings, debt, investments, insurance, emergency fund & tax planning.
            </p>
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              {DIMENSIONS.map(d => (
                <span
                  key={d.key}
                  className="px-3 py-1 rounded-full text-xs font-mono"
                  style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
                >
                  {d.icon} {d.label}
                </span>
              ))}
            </div>
            <button
              onClick={() => setStep(1)}
              className="px-8 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105 active:scale-95"
              style={{ background: 'var(--accent-amber)', color: '#000' }}
            >
              Start (6 questions) →
            </button>
          </motion.div>
        )}

        {/* Questions */}
        {step >= 1 && step <= 6 && currentDim && (
          <motion.div
            key={`q${step}`}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Progress */}
            <div className="flex items-center gap-2 mb-5">
              {DIMENSIONS.map((d, i) => (
                <div
                  key={d.key}
                  className="h-1 flex-1 rounded-full transition-all duration-500"
                  style={{
                    background: i < step ? 'var(--accent-amber)' : i === step - 1 ? 'var(--accent-amber)' : 'var(--bg-elevated)',
                    opacity: i < step ? 1 : 0.3,
                  }}
                />
              ))}
              <span className="text-xs font-mono ml-1 shrink-0" style={{ color: 'var(--text-muted)' }}>
                {step}/6
              </span>
            </div>

            <div
              className="text-3xl mb-3 text-center"
              style={{ filter: 'drop-shadow(0 0 12px rgba(245,158,11,0.4))' }}
            >
              {currentDim.icon}
            </div>
            <h3 className="font-display font-bold text-base text-center mb-1" style={{ color: 'var(--accent-amber)' }}>
              {currentDim.label}
            </h3>
            <p className="text-sm text-center mb-5" style={{ color: 'var(--text-primary)' }}>
              {currentDim.question}
            </p>

            <div className="space-y-2">
              {currentDim.options.map((opt) => (
                <motion.button
                  key={opt.label}
                  whileHover={{ scale: 1.01, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswer(opt.score)}
                  className="w-full text-left px-4 py-3 rounded-xl text-sm transition-all"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent-amber-border)';
                    (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-amber-glow)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-subtle)';
                    (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-elevated)';
                  }}
                >
                  {opt.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Results */}
        {step === 7 && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Radar */}
            <div>
              <div style={{ height: '280px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.06)" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fontSize: 11, fill: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}
                    />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="#F59E0B"
                      fill="#F59E0B"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                    <Tooltip content={<CustomRadarTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Score + Breakdown */}
            <div className="flex flex-col justify-center space-y-4">
              {/* Big score */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="text-center p-5 rounded-2xl"
                style={{
                  background: 'var(--accent-amber-glow)',
                  border: '1px solid var(--accent-amber-border)',
                }}
              >
                <div className="text-5xl font-display font-black" style={{ color: 'var(--accent-amber)' }}>
                  {totalScore}
                </div>
                <div className="text-sm font-mono mt-1" style={{ color: 'var(--text-secondary)' }}>
                  / 100 · Grade{' '}
                  <span className="font-bold" style={{ color: grade?.color }}>
                    {grade?.grade}
                  </span>
                  {' '}· {grade?.label}
                </div>
                <div className="mt-3 text-xs font-mono p-2 rounded-lg" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                  📱 "My Money Radar Score: {totalScore}/100 — what's yours?"
                </div>
              </motion.div>

              {/* Dimension breakdown */}
              <div className="space-y-2">
                {DIMENSIONS.map((dim, i) => (
                  <motion.div
                    key={dim.key}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i + 0.3 }}
                    className="flex items-center gap-3"
                  >
                    <span className="text-sm w-4">{dim.icon}</span>
                    <span className="text-xs w-24 shrink-0" style={{ color: 'var(--text-secondary)' }}>
                      {dim.label}
                    </span>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${scores[dim.key] ?? 0}%` }}
                        transition={{ delay: 0.1 * i + 0.5, duration: 0.6, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ background: dim.color }}
                      />
                    </div>
                    <span className="text-xs font-mono w-8 text-right" style={{ color: 'var(--text-muted)' }}>
                      {scores[dim.key] ?? 0}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
