'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

const ZONES = [
  { label: 'Extreme Fear', min: 0, max: 25, color: '#DC143C', bg: 'rgba(220,20,60,0.15)', emoji: '😱' },
  { label: 'Fear', min: 25, max: 45, color: '#FB923C', bg: 'rgba(251,146,60,0.15)', emoji: '😟' },
  { label: 'Neutral', min: 45, max: 55, color: '#FBBF24', bg: 'rgba(251,191,36,0.15)', emoji: '😐' },
  { label: 'Greed', min: 55, max: 75, color: '#84CC16', bg: 'rgba(132,204,22,0.15)', emoji: '😏' },
  { label: 'Extreme Greed', min: 75, max: 100, color: '#22C55E', bg: 'rgba(34,197,94,0.15)', emoji: '🤑' },
];

function getZone(value: number) {
  return ZONES.find(z => value >= z.min && value <= z.max) ?? ZONES[2];
}

// Simulated India F&G components (since no live API)
function simulateFearGreed() {
  // Use time-based pseudo-random that drifts slowly
  const now = Date.now();
  const seed = Math.sin(now / 120000) * 0.5 + Math.sin(now / 47000) * 0.3 + Math.sin(now / 23000) * 0.2;
  // Base around 55 (slightly greedy market), vary by ±20
  return Math.max(5, Math.min(95, Math.round(55 + seed * 22)));
}

function getSubComponents(base: number) {
  const noise = () => (Math.random() - 0.5) * 15;
  return [
    { label: 'Market Momentum', value: Math.max(5, Math.min(95, base + noise())), icon: '📊' },
    { label: 'Volatility (VIX)', value: Math.max(5, Math.min(95, 100 - base + noise() * 0.5)), icon: '🌊' },
    { label: 'Market Breadth', value: Math.max(5, Math.min(95, base + noise())), icon: '📡' },
    { label: 'FII Activity', value: Math.max(5, Math.min(95, base + noise())), icon: '🌏' },
    { label: 'Put/Call Ratio', value: Math.max(5, Math.min(95, 100 - base + noise() * 0.5)), icon: '⚖️' },
  ].map(c => ({ ...c, value: Math.round(c.value) }));
}

// SVG Gauge needle
function GaugeNeedle({ value }: { value: number }) {
  // value 0–100 maps to -90deg to +90deg
  const angle = (value / 100) * 180 - 90;
  const zone = getZone(value);

  return (
    <motion.g
      animate={{ rotate: angle }}
      initial={{ rotate: -90 }}
      transition={{ type: 'spring', stiffness: 40, damping: 15 }}
      style={{ originX: '50%', originY: '100%', transformBox: 'fill-box' }}
    >
      {/* Needle */}
      <line
        x1="0"
        y1="0"
        x2="0"
        y2="-75"
        stroke={zone.color}
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Center dot */}
      <circle cx="0" cy="0" r="6" fill={zone.color} />
      <circle cx="0" cy="0" r="3" fill="#080808" />
    </motion.g>
  );
}

export function FearGreedIndex() {
  const [value, setValue] = useState(simulateFearGreed());
  const [subComponents, setSubComponents] = useState(getSubComponents(value));
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [prevValue, setPrevValue] = useState(value);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Drift the value slowly every 4 seconds
    tickRef.current = setInterval(() => {
      setValue(prev => {
        const next = simulateFearGreed();
        const drift = Math.round(prev + (next - prev) * 0.15 + (Math.random() - 0.5) * 2);
        const clamped = Math.max(5, Math.min(95, drift));
        setPrevValue(prev);
        setSubComponents(getSubComponents(clamped));
        setLastUpdated(new Date());
        return clamped;
      });
    }, 3500);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, []);

  const zone = getZone(value);
  const direction = value > prevValue ? '▲' : value < prevValue ? '▼' : '—';

  // Arc path helpers
  const polarToXY = (deg: number, r: number, cx: number, cy: number) => {
    const rad = (deg - 180) * (Math.PI / 180);
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  };

  const arcPath = (startDeg: number, endDeg: number, r: number, cx: number, cy: number) => {
    const s = polarToXY(startDeg, r, cx, cy);
    const e = polarToXY(endDeg, r, cx, cy);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
  };

  const cx = 100, cy = 95, r = 80;

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
          🎰
        </div>
        <div>
          <h2 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            India Fear & Greed Index
          </h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Live market sentiment · refreshes every few seconds
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-mono" style={{ color: 'var(--accent-green)' }}>LIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gauge */}
        <div className="flex flex-col items-center">
          <div className="relative w-full" style={{ maxWidth: 220 }}>
            <svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" className="w-full">
              {/* Background arc segments */}
              {ZONES.map((z, i) => {
                const startDeg = (z.min / 100) * 180;
                const endDeg = (z.max / 100) * 180;
                return (
                  <path
                    key={z.label}
                    d={arcPath(startDeg, endDeg, r, cx, cy)}
                    stroke={z.color}
                    strokeWidth={14}
                    fill="none"
                    strokeOpacity={0.3}
                  />
                );
              })}

              {/* Active arc up to value */}
              <path
                d={arcPath(0, (value / 100) * 180, r, cx, cy)}
                stroke={zone.color}
                strokeWidth={14}
                fill="none"
                style={{ transition: 'all 1s ease' }}
              />

              {/* Zone labels */}
              {[
                { deg: 10, label: 'Fear' },
                { deg: 90, label: 'Neutral' },
                { deg: 170, label: 'Greed' },
              ].map(({ deg, label }) => {
                const pos = polarToXY(deg, r - 22, cx, cy);
                return (
                  <text
                    key={label}
                    x={pos.x}
                    y={pos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={6}
                    fill="rgba(255,255,255,0.35)"
                    fontFamily="var(--font-mono)"
                  >
                    {label}
                  </text>
                );
              })}

              {/* Needle group centered at bottom */}
              <g transform={`translate(${cx}, ${cy})`}>
                <GaugeNeedle value={value} />
              </g>

              {/* Value in center */}
              <text
                x={cx}
                y={cy + 16}
                textAnchor="middle"
                fontSize={22}
                fontWeight="bold"
                fill={zone.color}
                fontFamily="var(--font-display)"
              >
                {value}
              </text>
            </svg>
          </div>

          {/* Zone label */}
          <motion.div
            key={zone.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mt-1"
          >
            <div className="text-3xl mb-1">{zone.emoji}</div>
            <div
              className="font-display font-bold text-xl px-4 py-1 rounded-full"
              style={{ color: zone.color, background: zone.bg, border: `1px solid ${zone.color}44` }}
            >
              {zone.label}
            </div>
            <div className="text-xs font-mono mt-2" style={{ color: 'var(--text-muted)' }}>
              {direction} {Math.abs(value - prevValue)} pts · Updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
          </motion.div>

          {/* Historical scale */}
          <div className="w-full mt-4">
            <div className="text-xs font-mono mb-2 text-center" style={{ color: 'var(--text-muted)' }}>
              TODAY vs HISTORY
            </div>
            <div className="flex gap-2">
              {[
                { label: '1 wk ago', val: Math.max(5, Math.min(95, value + (Math.random() > 0.5 ? 1 : -1) * Math.round(Math.random() * 12))) },
                { label: '1 mo ago', val: Math.max(5, Math.min(95, value + (Math.random() > 0.5 ? 1 : -1) * Math.round(Math.random() * 18))) },
                { label: '1 yr ago', val: Math.max(5, Math.min(95, value + (Math.random() > 0.5 ? 1 : -1) * Math.round(Math.random() * 25))) },
              ].map(h => {
                const hz = getZone(h.val);
                return (
                  <div key={h.label} className="flex-1 text-center p-2 rounded-lg" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{h.label}</div>
                    <div className="font-mono font-bold text-sm" style={{ color: hz.color }}>{h.val}</div>
                    <div className="text-xs" style={{ color: hz.color }}>{hz.label.split(' ')[0]}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sub-components */}
        <div>
          <div className="text-xs font-mono mb-3" style={{ color: 'var(--text-muted)' }}>
            SUB-COMPONENTS
          </div>
          <div className="space-y-3">
            {subComponents.map((comp) => {
              const z = getZone(comp.value);
              return (
                <div key={comp.label}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                      <span>{comp.icon}</span>
                      {comp.label}
                    </span>
                    <span className="text-xs font-mono font-bold" style={{ color: z.color }}>
                      {comp.value} · {z.label}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      animate={{ width: `${comp.value}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      style={{ background: z.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Insight box */}
          <div
            className="mt-5 p-4 rounded-xl"
            style={{ background: zone.bg, border: `1px solid ${zone.color}33` }}
          >
            <div className="text-xs font-mono font-bold mb-1" style={{ color: zone.color }}>
              MARKET SIGNAL
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {value >= 75
                ? 'Extreme greed — markets are overheated. Consider booking profits. Historically, extreme greed precedes corrections.'
                : value >= 55
                ? 'Greed is dominant. Momentum is strong, but exercise caution near resistance levels.'
                : value >= 45
                ? 'Market sentiment is balanced. Look for quality stocks at fair valuations.'
                : value >= 25
                ? 'Fear is present. This has historically been a good time to accumulate blue-chips via SIPs.'
                : 'Extreme fear — a potential buying opportunity for long-term investors. Stay cautious short-term.'}
            </p>
          </div>

          <div className="mt-3 text-xs font-mono p-2 rounded-lg text-center" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
            Disclaimer: Simulated sentiment indicator. Not a buy/sell signal.
          </div>
        </div>
      </div>
    </motion.div>
  );
}
