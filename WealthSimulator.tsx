'use client';
import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useTranslation } from 'react-i18next';

type SimData = { year: number; invested: number; wealth: number; inflationAdjusted: number };

const INFLATION_RATE = 0.06;

function formatCrore(val: number) {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
  return `₹${val.toLocaleString('en-IN')}`;
}

export function WealthSimulator() {
  const { t } = useTranslation();
  const [principal, setPrincipal] = useState(50000);
  const [monthly, setMonthly] = useState(5000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(20);
  const [data, setData] = useState<SimData[]>([]);
  const [summary, setSummary] = useState<{ futureValue: number; totalInvested: number; wealthGained: number; inflationAdjusted: number } | null>(null);

  const simulate = useCallback(() => {
    const monthlyRate = rate / 100 / 12;
    const simData: SimData[] = [];
    let totalInvested = principal;
    let currentValue = principal;

    for (let y = 1; y <= years; y++) {
      for (let m = 0; m < 12; m++) {
        currentValue = currentValue * (1 + monthlyRate) + monthly;
        totalInvested += monthly;
      }
      const inflAdj = currentValue / Math.pow(1 + INFLATION_RATE, y);
      simData.push({
        year: y,
        invested: Math.round(totalInvested),
        wealth: Math.round(currentValue),
        inflationAdjusted: Math.round(inflAdj),
      });
    }

    setData(simData);
    const last = simData[simData.length - 1];
    setSummary({
      futureValue: last.wealth,
      totalInvested: last.invested,
      wealthGained: last.wealth - last.invested,
      inflationAdjusted: last.inflationAdjusted,
    });
  }, [principal, monthly, rate, years]);

  const SliderInput = ({
    label, value, onChange, min, max, step, format
  }: {
    label: string; value: number; onChange: (v: number) => void;
    min: number; max: number; step: number; format: (v: number) => string;
  }) => (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</label>
        <span className="text-sm font-mono font-bold" style={{ color: 'var(--accent-amber)' }}>
          {format(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, var(--accent-amber) 0%, var(--accent-amber) ${((value - min) / (max - min)) * 100}%, var(--bg-elevated) ${((value - min) / (max - min)) * 100}%, var(--bg-elevated) 100%)`,
        }}
      />
    </div>
  );

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean; payload?: { dataKey: string; value: number; color: string }[]; label?: string;
  }) => {
    if (!active || !payload?.length) return null;
    return (
      <div
        className="glass-card p-3 text-xs font-mono space-y-1"
        style={{ border: '1px solid var(--border-accent)' }}
      >
        <p style={{ color: 'var(--text-secondary)' }}>Year {label}</p>
        {payload.map((p) => (
          <p key={p.dataKey} style={{ color: p.color }}>
            {p.dataKey === 'wealth' ? 'Future Value' : p.dataKey === 'invested' ? 'Invested' : 'Inflation Adj.'}:{' '}
            {formatCrore(p.value)}
          </p>
        ))}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-base p-5"
    >
      <div className="mb-5">
        <h2 className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
          {t('simulator.title')}
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          {t('simulator.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-5">
          <SliderInput
            label={t('simulator.principal')}
            value={principal}
            onChange={setPrincipal}
            min={0} max={1000000} step={10000}
            format={(v) => `₹${v.toLocaleString('en-IN')}`}
          />
          <SliderInput
            label={t('simulator.monthly')}
            value={monthly}
            onChange={setMonthly}
            min={500} max={100000} step={500}
            format={(v) => `₹${v.toLocaleString('en-IN')}`}
          />
          <SliderInput
            label={t('simulator.rate')}
            value={rate}
            onChange={setRate}
            min={4} max={25} step={0.5}
            format={(v) => `${v}%`}
          />
          <SliderInput
            label={t('simulator.years')}
            value={years}
            onChange={setYears}
            min={1} max={40} step={1}
            format={(v) => `${v} yrs`}
          />
          <button
            onClick={simulate}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: 'var(--accent-amber)', color: '#000' }}
          >
            {t('simulator.calculate')}
          </button>
        </div>

        {/* Results */}
        <div>
          {summary ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: t('simulator.futureValue'), value: summary.futureValue, highlight: true },
                  { label: t('simulator.totalInvested'), value: summary.totalInvested, highlight: false },
                  { label: t('simulator.wealthGained'), value: summary.wealthGained, highlight: false },
                  { label: t('simulator.inflationAdjusted'), value: summary.inflationAdjusted, highlight: false },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="p-3 rounded-xl"
                    style={{
                      background: item.highlight ? 'var(--accent-amber-glow)' : 'var(--bg-elevated)',
                      border: `1px solid ${item.highlight ? 'var(--accent-amber-border)' : 'var(--border-subtle)'}`,
                    }}
                  >
                    <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
                    <p
                      className="font-mono font-bold text-sm"
                      style={{ color: item.highlight ? 'var(--accent-amber)' : 'var(--text-primary)' }}
                    >
                      {formatCrore(item.value)}
                    </p>
                  </div>
                ))}
              </div>

              <div style={{ height: '200px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="wealthGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="investedGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22C55E" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="year" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} tickFormatter={(v) => v >= 10000000 ? `${(v/10000000).toFixed(1)}Cr` : v >= 100000 ? `${(v/100000).toFixed(0)}L` : v.toString()} width={35} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="wealth" stroke="#F59E0B" strokeWidth={2} fill="url(#wealthGrad)" dot={false} />
                    <Area type="monotone" dataKey="invested" stroke="#22C55E" strokeWidth={2} fill="url(#investedGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div
              className="h-full flex flex-col items-center justify-center rounded-xl text-center p-6"
              style={{ background: 'var(--bg-elevated)', minHeight: '200px' }}
            >
              <div className="text-4xl mb-3 animate-float">📈</div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Adjust sliders & simulate
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                See your wealth grow over time
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
