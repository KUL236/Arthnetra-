'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { RefreshCw, TrendingUp, TrendingDown, Minus } from 'lucide-react';

type Sector = {
  name: string;
  change: number;
  risk: string;
  shares?: string;
  pct?: number;
};

const FALLBACK_SECTORS: Sector[] = [
  { name: 'Banking', change: 0.85, risk: 'Medium', shares: 'HDFCBANK, ICICIBANK, SBIN', pct: 28.4 },
  { name: 'IT', change: 1.20, risk: 'Medium', shares: 'TCS, INFY, WIPRO', pct: 15.3 },
  { name: 'Pharma', change: 0.45, risk: 'Low', shares: 'SUNPHARMA, DRREDDY, CIPLA', pct: 5.1 },
  { name: 'Auto/EV', change: 1.80, risk: 'Medium', shares: 'MARUTI, TATAMOTORS, M&M', pct: 7.8 },
  { name: 'Real Est.', change: 2.10, risk: 'High', shares: 'DLF, GODREJPROP, OBEROIRLTY', pct: 3.2 },
  { name: 'AI/Tech', change: 2.90, risk: 'High', shares: 'TCS, HCLTECH, LTIM', pct: 9.4 },
  { name: 'FMCG', change: 0.30, risk: 'Low', shares: 'HINDUNILVR, ITC, NESTLEIND', pct: 9.2 },
  { name: 'Metal', change: -0.60, risk: 'High', shares: 'TATASTEEL, JSWSTEEL, HINDALCO', pct: 3.8 },
];

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number; payload: Sector }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  const isUp = d.value >= 0;
  const sector = d.payload;
  return (
    <div
      className="glass-card px-3 py-2 text-xs font-mono"
      style={{ border: '1px solid var(--border-accent)', minWidth: 160 }}
    >
      <p style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{label}</p>
      <p style={{ color: isUp ? 'var(--accent-green)' : 'var(--accent-red)' }}>
        {isUp ? '+' : ''}{d.value.toFixed(2)}%
      </p>
      <p style={{ color: 'var(--text-muted)' }}>Risk: {sector.risk}</p>
      {sector.pct !== undefined && (
        <p style={{ color: 'var(--text-muted)' }}>Index weight: {sector.pct.toFixed(1)}%</p>
      )}
      {sector.shares && (
        <p style={{ color: 'var(--text-secondary)', marginTop: 2 }}>
          {sector.shares}
        </p>
      )}
    </div>
  );
};

function getMomentumIcon(change: number) {
  if (change > 1) return <TrendingUp size={10} />;
  if (change < -0.5) return <TrendingDown size={10} />;
  return <Minus size={10} />;
}

export function SectorRadar() {
  const { t } = useTranslation();
  const [sectors, setSectors] = useState<Sector[]>(FALLBACK_SECTORS);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [dataSource, setDataSource] = useState<string>('');

  const fetchSectors = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/market');
      if (!res.ok) throw new Error('error');
      const data = await res.json();
      if (data.sectors?.length > 0) {
        setSectors(data.sectors.map((s: { name: string; change?: number; risk?: string; shares?: string; pct?: number }) => ({
          name: s.name,
          change: typeof s.change === 'number' ? s.change : 0,
          risk: s.risk || 'Medium',
          shares: s.shares,
          pct: s.pct,
        })));
      }
      if (data.sectorSource) setDataSource(data.sectorSource);
      setLastUpdated(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
    } catch { /* use fallback */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchSectors();
    const interval = setInterval(fetchSectors, 300000); // refresh every 5 min
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isLive = dataSource.includes('live');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="card-base p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>
          {t('sectors.title')}
        </h3>
        <div className="flex items-center gap-2">
          {isLive ? (
            <span className="flex items-center gap-1 text-xs font-mono" style={{ color: 'var(--accent-green)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              LIVE
            </span>
          ) : (
            <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
              {lastUpdated || 'Today'}
            </span>
          )}
          <button
            onClick={fetchSectors}
            className="p-1.5 rounded-lg transition-opacity hover:opacity-70"
            style={{ color: 'var(--text-muted)', background: 'var(--bg-elevated)' }}
            title="Refresh sector data"
          >
            <RefreshCw size={11} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="shimmer-loading rounded-lg" style={{ height: '180px' }} />
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={sectors} margin={{ top: 5, right: 5, bottom: 20, left: -10 }}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 9, fill: 'var(--text-muted)', fontFamily: 'DM Sans' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 9, fill: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="change" radius={[4, 4, 0, 0]}>
              {sectors.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.change >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'}
                  fillOpacity={0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Sector pills with shares info */}
      <div className="flex flex-wrap gap-2 mt-3">
        {sectors.map((s) => (
          <div
            key={s.name}
            className="flex flex-col gap-0.5 px-2 py-1.5 rounded-lg text-xs font-mono"
            style={{
              background: s.change >= 0 ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
              color: s.change >= 0 ? 'var(--accent-green)' : 'var(--accent-red)',
              border: `1px solid ${s.change >= 0 ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
              minWidth: 90,
            }}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="font-bold" style={{ color: 'var(--text-primary)', fontSize: 10 }}>{s.name}</span>
              <span className="flex items-center gap-0.5 font-bold">
                {getMomentumIcon(s.change)}
                {s.change >= 0 ? '+' : ''}{s.change.toFixed(1)}%
              </span>
            </div>
            {s.shares && (
              <span style={{ color: 'var(--text-muted)', fontSize: 8, lineHeight: 1.3 }}>
                {s.shares}
              </span>
            )}
            {s.pct !== undefined && (
              <span style={{ color: 'var(--text-muted)', fontSize: 8 }}>
                {s.pct.toFixed(1)}% of index
              </span>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
