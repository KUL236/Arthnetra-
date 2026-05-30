'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type StateData = {
  id: string;
  name: string;
  activity: number; // 0–100
  topSectors: string[];
  exchanges: string[];
  listedCompanies: number;
  marketCap: string;
  trend: 'up' | 'down' | 'neutral';
  change: number;
};

const STATES_DATA: StateData[] = [
  { id: 'MH', name: 'Maharashtra', activity: 95, topSectors: ['Banking', 'IT', 'Finance', 'Pharma'], exchanges: ['NSE', 'BSE'], listedCompanies: 1847, marketCap: '₹180 L Cr', trend: 'up', change: 1.2 },
  { id: 'DL', name: 'Delhi NCR', activity: 88, topSectors: ['IT', 'Telecom', 'Retail', 'Real Estate'], exchanges: ['DSE'], listedCompanies: 423, marketCap: '₹42 L Cr', trend: 'up', change: 0.8 },
  { id: 'GJ', name: 'Gujarat', activity: 82, topSectors: ['Chemicals', 'Pharma', 'Textiles', 'Gems'], exchanges: ['AHSE'], listedCompanies: 312, marketCap: '₹38 L Cr', trend: 'up', change: 1.5 },
  { id: 'KA', name: 'Karnataka', activity: 78, topSectors: ['IT/Tech', 'Biotech', 'Aerospace', 'FMCG'], exchanges: ['BgSE'], listedCompanies: 287, marketCap: '₹31 L Cr', trend: 'up', change: 0.9 },
  { id: 'TN', name: 'Tamil Nadu', activity: 72, topSectors: ['Auto', 'IT', 'Textiles', 'Engineering'], exchanges: ['MSE'], listedCompanies: 254, marketCap: '₹24 L Cr', trend: 'neutral', change: 0.1 },
  { id: 'WB', name: 'West Bengal', activity: 58, topSectors: ['Jute', 'Steel', 'FMCG', 'Retail'], exchanges: ['CSE'], listedCompanies: 198, marketCap: '₹15 L Cr', trend: 'down', change: -0.4 },
  { id: 'RJ', name: 'Rajasthan', activity: 52, topSectors: ['Mining', 'Gems', 'Tourism', 'Agriculture'], exchanges: ['JSE'], listedCompanies: 87, marketCap: '₹8 L Cr', trend: 'neutral', change: 0.2 },
  { id: 'UP', name: 'Uttar Pradesh', activity: 48, topSectors: ['Sugar', 'FMCG', 'Leather', 'IT'], exchanges: ['USE'], listedCompanies: 143, marketCap: '₹11 L Cr', trend: 'up', change: 0.6 },
  { id: 'TS', name: 'Telangana', activity: 68, topSectors: ['Pharma', 'IT', 'Defence', 'Agriculture'], exchanges: ['HSE'], listedCompanies: 164, marketCap: '₹18 L Cr', trend: 'up', change: 1.1 },
  { id: 'AP', name: 'Andhra Pradesh', activity: 55, topSectors: ['Pharma', 'Aquaculture', 'Cement', 'IT'], exchanges: [], listedCompanies: 112, marketCap: '₹9 L Cr', trend: 'neutral', change: -0.1 },
  { id: 'PB', name: 'Punjab', activity: 45, topSectors: ['Agriculture', 'Textiles', 'Sports goods', 'Auto'], exchanges: ['LSE'], listedCompanies: 67, marketCap: '₹5 L Cr', trend: 'down', change: -0.5 },
  { id: 'HR', name: 'Haryana', activity: 60, topSectors: ['Auto', 'IT', 'Real Estate', 'FMCG'], exchanges: [], listedCompanies: 98, marketCap: '₹12 L Cr', trend: 'up', change: 0.7 },
  { id: 'MP', name: 'Madhya Pradesh', activity: 40, topSectors: ['Mining', 'Agriculture', 'Tourism', 'IT'], exchanges: ['MPSE'], listedCompanies: 54, marketCap: '₹4 L Cr', trend: 'neutral', change: 0.0 },
  { id: 'OD', name: 'Odisha', activity: 43, topSectors: ['Steel', 'Mining', 'Power', 'Agriculture'], exchanges: [], listedCompanies: 38, marketCap: '₹3 L Cr', trend: 'down', change: -0.3 },
  { id: 'KL', name: 'Kerala', activity: 50, topSectors: ['IT', 'Tourism', 'Rubber', 'Fisheries'], exchanges: ['CSE'], listedCompanies: 76, marketCap: '₹7 L Cr', trend: 'neutral', change: 0.2 },
];

function getActivityColor(activity: number, isSelected: boolean): string {
  if (isSelected) return '#F59E0B';
  if (activity >= 85) return '#22C55E';
  if (activity >= 70) return '#84CC16';
  if (activity >= 55) return '#FBBF24';
  if (activity >= 40) return '#FB923C';
  return '#DC143C';
}

// Simplified SVG paths for India states (approximate, not geo-accurate)
// Using a grid-based representation for clarity in a dashboard context
const STATE_GRID: { id: string; row: number; col: number; w?: number; h?: number }[] = [
  { id: 'PB', row: 0, col: 2 },
  { id: 'HR', row: 1, col: 2 },
  { id: 'DL', row: 1, col: 3 },
  { id: 'RJ', row: 1, col: 1 },
  { id: 'UP', row: 2, col: 3, w: 2 },
  { id: 'GJ', row: 2, col: 0 },
  { id: 'MP', row: 3, col: 2, w: 2 },
  { id: 'MH', row: 3, col: 1 },
  { id: 'WB', row: 3, col: 4 },
  { id: 'OD', row: 4, col: 4 },
  { id: 'TS', row: 4, col: 2 },
  { id: 'AP', row: 4, col: 3 },
  { id: 'KA', row: 5, col: 2 },
  { id: 'TN', row: 5, col: 3 },
  { id: 'KL', row: 6, col: 2 },
];

export function IndiaStateHeatMap() {
  const [selected, setSelected] = useState<StateData | null>(STATES_DATA[0]);
  const [hovered, setHovered] = useState<string | null>(null);

  const CELL = 56;
  const GAP = 4;
  const cols = 6;
  const rows = 7;
  const svgW = cols * (CELL + GAP);
  const svgH = rows * (CELL + GAP);

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
          🗺️
        </div>
        <div>
          <h2 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            India State Heat Map
          </h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Click any state · Market activity by region
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-xs font-mono" style={{ color: 'var(--accent-amber)' }}>INDIA</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Map grid */}
        <div>
          <svg
            viewBox={`0 0 ${svgW} ${svgH}`}
            className="w-full"
            style={{ maxHeight: 360 }}
          >
            {STATE_GRID.map(cell => {
              const state = STATES_DATA.find(s => s.id === cell.id);
              if (!state) return null;
              const x = cell.col * (CELL + GAP);
              const y = cell.row * (CELL + GAP);
              const w = (cell.w ?? 1) * CELL + ((cell.w ?? 1) - 1) * GAP;
              const h = (cell.h ?? 1) * CELL + ((cell.h ?? 1) - 1) * GAP;
              const isSelected = selected?.id === state.id;
              const isHovered = hovered === state.id;
              const color = getActivityColor(state.activity, isSelected);

              return (
                <g
                  key={state.id}
                  onClick={() => setSelected(state)}
                  onMouseEnter={() => setHovered(state.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: 'pointer' }}
                >
                  <rect
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    rx={8}
                    fill={color}
                    fillOpacity={isSelected ? 1 : isHovered ? 0.7 : 0.45}
                    stroke={isSelected ? '#F59E0B' : color}
                    strokeWidth={isSelected ? 2 : 1}
                    strokeOpacity={isSelected ? 1 : 0.3}
                    style={{ transition: 'all 0.2s ease' }}
                  />
                  {/* Glow effect for selected */}
                  {isSelected && (
                    <rect
                      x={x - 2}
                      y={y - 2}
                      width={w + 4}
                      height={h + 4}
                      rx={10}
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth={1}
                      strokeOpacity={0.3}
                    />
                  )}
                  <text
                    x={x + w / 2}
                    y={y + h / 2 - 6}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={9}
                    fontWeight="bold"
                    fill={isSelected ? '#000' : 'rgba(255,255,255,0.9)'}
                    fontFamily="var(--font-mono)"
                  >
                    {state.id}
                  </text>
                  <text
                    x={x + w / 2}
                    y={y + h / 2 + 8}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={7}
                    fill={isSelected ? '#00000088' : 'rgba(255,255,255,0.6)'}
                    fontFamily="var(--font-mono)"
                  >
                    {state.activity}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-3 text-xs font-mono justify-center">
            {[
              { label: 'High', color: '#22C55E' },
              { label: 'Medium', color: '#FBBF24' },
              { label: 'Low', color: '#DC143C' },
            ].map(l => (
              <span key={l.label} className="flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                <span className="w-3 h-3 rounded" style={{ background: l.color, opacity: 0.6 }} />
                {l.label}
              </span>
            ))}
            <span style={{ color: 'var(--accent-amber)' }} className="flex items-center gap-1">
              <span className="w-3 h-3 rounded border border-amber-500" style={{ background: '#F59E0B' }} />
              Selected
            </span>
          </div>
        </div>

        {/* State detail panel */}
        <div>
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="space-y-4"
              >
                {/* State header */}
                <div
                  className="p-4 rounded-xl"
                  style={{
                    background: 'var(--accent-amber-glow)',
                    border: '1px solid var(--accent-amber-border)',
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
                        {selected.name}
                      </div>
                      <div className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {selected.id} · India
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className="font-mono font-bold text-2xl"
                        style={{ color: getActivityColor(selected.activity, false) }}
                      >
                        {selected.activity}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Activity Score</div>
                    </div>
                  </div>

                  {/* Activity bar */}
                  <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${selected.activity}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: getActivityColor(selected.activity, false) }}
                    />
                  </div>

                  {/* Change */}
                  <div className="mt-2 text-xs font-mono" style={{
                    color: selected.trend === 'up' ? '#22C55E' : selected.trend === 'down' ? '#DC143C' : 'var(--text-muted)',
                  }}>
                    {selected.trend === 'up' ? '▲' : selected.trend === 'down' ? '▼' : '—'}{' '}
                    {Math.abs(selected.change).toFixed(1)}% today
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Listed Companies</div>
                    <div className="font-mono font-bold text-base mt-0.5" style={{ color: 'var(--text-primary)' }}>
                      {selected.listedCompanies.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Est. Market Cap</div>
                    <div className="font-mono font-bold text-base mt-0.5" style={{ color: 'var(--accent-amber)' }}>
                      {selected.marketCap}
                    </div>
                  </div>
                </div>

                {/* Top sectors */}
                <div>
                  <div className="text-xs font-mono mb-2" style={{ color: 'var(--text-muted)' }}>
                    DOMINANT SECTORS
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selected.topSectors.map((s, i) => (
                      <motion.span
                        key={s}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.07 }}
                        className="px-3 py-1 rounded-full text-xs font-mono"
                        style={{
                          background: i === 0 ? 'var(--accent-amber-glow)' : 'var(--bg-elevated)',
                          border: `1px solid ${i === 0 ? 'var(--accent-amber-border)' : 'var(--border-subtle)'}`,
                          color: i === 0 ? 'var(--accent-amber)' : 'var(--text-secondary)',
                        }}
                      >
                        {s}
                      </motion.span>
                    ))}
                  </div>
                </div>

                {/* Exchanges */}
                {selected.exchanges.length > 0 && (
                  <div>
                    <div className="text-xs font-mono mb-2" style={{ color: 'var(--text-muted)' }}>
                      LOCAL EXCHANGES
                    </div>
                    <div className="flex gap-2">
                      {selected.exchanges.map(e => (
                        <span
                          key={e}
                          className="px-3 py-1 rounded-full text-xs font-mono"
                          style={{
                            background: 'rgba(96,165,250,0.1)',
                            border: '1px solid rgba(96,165,250,0.2)',
                            color: '#60A5FA',
                          }}
                        >
                          {e}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="flex items-center justify-center h-full" style={{ color: 'var(--text-muted)', minHeight: 200 }}>
                <div className="text-center">
                  <div className="text-4xl mb-3">🗺️</div>
                  <p className="text-sm">Click any state to see details</p>
                </div>
              </div>
            )}
          </AnimatePresence>

          {/* Top 5 states by activity */}
          <div className="mt-4">
            <div className="text-xs font-mono mb-2" style={{ color: 'var(--text-muted)' }}>
              TOP 5 BY MARKET ACTIVITY
            </div>
            <div className="space-y-1.5">
              {[...STATES_DATA]
                .sort((a, b) => b.activity - a.activity)
                .slice(0, 5)
                .map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => setSelected(s)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:scale-[1.01]"
                    style={{
                      background: selected?.id === s.id ? 'var(--accent-amber-glow)' : 'var(--bg-elevated)',
                      border: `1px solid ${selected?.id === s.id ? 'var(--accent-amber-border)' : 'var(--border-subtle)'}`,
                    }}
                  >
                    <span className="text-xs font-mono w-4" style={{ color: 'var(--text-muted)' }}>#{i + 1}</span>
                    <span className="text-xs flex-1 text-left" style={{ color: 'var(--text-primary)' }}>{s.name}</span>
                    <div className="h-1 w-16 rounded-full overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${s.activity}%`, background: getActivityColor(s.activity, false) }}
                      />
                    </div>
                    <span className="text-xs font-mono w-6 text-right" style={{ color: getActivityColor(s.activity, false) }}>
                      {s.activity}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
