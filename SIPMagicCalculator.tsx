'use client';
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

function formatCrore(val: number) {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
  return `₹${val.toLocaleString('en-IN')}`;
}

function formatShort(val: number) {
  if (val >= 10000000) return `${(val / 10000000).toFixed(1)}Cr`;
  if (val >= 100000) return `${(val / 100000).toFixed(0)}L`;
  return `${(val / 1000).toFixed(0)}K`;
}

const BENCHMARKS = [
  { label: 'Nifty 50 (30yr avg)', rate: 14.5, icon: '📊' },
  { label: 'Large Cap MF', rate: 13, icon: '🏦' },
  { label: 'Mid Cap MF', rate: 16, icon: '📈' },
  { label: 'PPF (safe)', rate: 7.1, icon: '🔒' },
  { label: 'FD (typical)', rate: 7.0, icon: '💵' },
];

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: { dataKey: string; value: number; color: string }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="glass-card p-3 text-xs font-mono space-y-1.5"
      style={{ border: '1px solid var(--border-accent)', minWidth: 150 }}
    >
      <p className="font-bold" style={{ color: 'var(--text-secondary)' }}>Year {label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex justify-between gap-4">
          <span style={{ color: p.color }}>
            {p.dataKey === 'corpus' ? 'Corpus' : 'Invested'}
          </span>
          <span style={{ color: 'var(--text-primary)' }}>{formatCrore(p.value)}</span>
        </div>
      ))}
      {payload.length === 2 && (
        <div className="flex justify-between gap-4 pt-1" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <span style={{ color: '#A78BFA' }}>Returns</span>
          <span style={{ color: '#A78BFA' }}>
            {formatCrore(payload[0].value - payload[1].value)}
          </span>
        </div>
      )}
    </div>
  );
};

export function SIPMagicCalculator() {
  const [amount, setAmount] = useState(10000);
  const [years, setYears] = useState(15);
  const [rate, setRate] = useState(14.5);

  const { chartData, corpus, invested, returns, multiplier } = useMemo(() => {
    const monthlyRate = rate / 100 / 12;
    let currentValue = 0;
    let totalInvested = 0;
    const data = [];

    for (let y = 1; y <= years; y++) {
      for (let m = 0; m < 12; m++) {
        currentValue = currentValue * (1 + monthlyRate) + amount;
        totalInvested += amount;
      }
      data.push({
        year: y,
        corpus: Math.round(currentValue),
        invested: Math.round(totalInvested),
      });
    }

    const last = data[data.length - 1];
    return {
      chartData: data,
      corpus: last.corpus,
      invested: last.invested,
      returns: last.corpus - last.invested,
      multiplier: last.corpus / last.invested,
    };
  }, [amount, years, rate]);

  const SliderInput = ({
    label, value, onChange, min, max, step, format, hint
  }: {
    label: string; value: number; onChange: (v: number) => void;
    min: number; max: number; step: number; format: (v: number) => string; hint?: string;
  }) => (
    <div>
      <div className="flex justify-between items-baseline mb-1.5">
        <div>
          <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{label}</label>
          {hint && <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>{hint}</span>}
        </div>
        <span className="text-base font-mono font-bold" style={{ color: 'var(--accent-amber)' }}>
          {format(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, var(--accent-amber) 0%, var(--accent-amber) ${((value - min) / (max - min)) * 100}%, var(--bg-elevated) ${((value - min) / (max - min)) * 100}%, var(--bg-elevated) 100%)`,
        }}
      />
      <div className="flex justify-between text-xs font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );

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
          ✨
        </div>
        <div>
          <h2 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            SIP Magic Calculator
          </h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Watch compound interest work its magic in real-time
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Controls */}
        <div className="lg:col-span-2 space-y-5">
          <SliderInput
            label="Monthly SIP"
            value={amount}
            onChange={setAmount}
            min={500} max={200000} step={500}
            format={v => `₹${v.toLocaleString('en-IN')}`}
          />
          <SliderInput
            label="Duration"
            value={years}
            onChange={setYears}
            min={1} max={40} step={1}
            format={v => `${v} yrs`}
          />
          <SliderInput
            label="Expected Return"
            value={rate}
            onChange={setRate}
            min={4} max={30} step={0.5}
            format={v => `${v}%`}
            hint="p.a."
          />

          {/* Benchmarks */}
          <div>
            <div className="text-xs font-mono mb-2" style={{ color: 'var(--text-muted)' }}>
              QUICK BENCHMARKS
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {BENCHMARKS.map(b => (
                <button
                  key={b.label}
                  onClick={() => setRate(b.rate)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all hover:scale-[1.01]"
                  style={{
                    background: rate === b.rate ? 'var(--accent-amber-glow)' : 'var(--bg-elevated)',
                    border: `1px solid ${rate === b.rate ? 'var(--accent-amber-border)' : 'var(--border-subtle)'}`,
                    color: rate === b.rate ? 'var(--accent-amber)' : 'var(--text-secondary)',
                  }}
                >
                  <span>{b.icon} {b.label}</span>
                  <span className="font-mono font-bold">{b.rate}%</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results + Chart */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: 'Total Corpus', value: formatCrore(corpus), color: 'var(--accent-amber)', highlight: true },
              { label: 'Invested', value: formatCrore(invested), color: 'var(--accent-green)', highlight: false },
              { label: 'Returns', value: formatCrore(returns), color: '#A78BFA', highlight: false },
              { label: 'Multiplier', value: `${multiplier.toFixed(1)}×`, color: '#60A5FA', highlight: false },
            ].map(s => (
              <motion.div
                key={s.label}
                layout
                className="p-3 rounded-xl text-center"
                style={{
                  background: s.highlight ? 'var(--accent-amber-glow)' : 'var(--bg-elevated)',
                  border: `1px solid ${s.highlight ? 'var(--accent-amber-border)' : 'var(--border-subtle)'}`,
                }}
              >
                <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
                <motion.div
                  key={s.value}
                  initial={{ opacity: 0.5, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-mono font-bold text-sm"
                  style={{ color: s.color }}
                >
                  {s.value}
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* The headline */}
          <div
            className="px-4 py-3 rounded-xl text-center"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
          >
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              ₹{amount.toLocaleString('en-IN')}/mo for {years} years at {rate}% =
            </span>
            {' '}
            <span className="font-display font-bold" style={{ color: 'var(--accent-amber)', fontSize: '1.1rem' }}>
              {formatCrore(corpus)}
            </span>
            <span className="ml-2 text-xs font-mono px-2 py-0.5 rounded-full" style={{ background: '#A78BFA22', color: '#A78BFA' }}>
              {multiplier.toFixed(1)}× your money
            </span>
          </div>

          {/* Chart */}
          <div style={{ height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="sipCorpusGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="sipInvestedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                  tickLine={false}
                  axisLine={false}
                  label={{ value: 'Years', position: 'insideBottomRight', offset: -5, fontSize: 10, fill: 'var(--text-muted)' }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatShort}
                  width={42}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="corpus"
                  stroke="#F59E0B"
                  strokeWidth={2.5}
                  fill="url(#sipCorpusGrad)"
                  dot={false}
                  animationDuration={800}
                />
                <Area
                  type="monotone"
                  dataKey="invested"
                  stroke="#22C55E"
                  strokeWidth={2}
                  fill="url(#sipInvestedGrad)"
                  dot={false}
                  animationDuration={800}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono justify-center" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 rounded inline-block" style={{ background: '#F59E0B' }} /> Corpus
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 rounded inline-block" style={{ background: '#22C55E' }} /> Invested
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 rounded inline-block" style={{ background: '#A78BFA' }} /> Returns gap
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
