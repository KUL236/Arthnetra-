'use client';
import { useEffect, useState, useCallback } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

type DataPoint = { time: string; value: number };

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="glass-card px-3 py-2 text-xs font-mono"
      style={{ border: '1px solid var(--border-accent)' }}
    >
      <p style={{ color: 'var(--text-secondary)' }}>{label}</p>
      <p style={{ color: 'var(--accent-amber)', fontWeight: 'bold' }}>
        ₹{payload[0].value.toLocaleString('en-IN')}
      </p>
    </div>
  );
};

type LiveChartProps = {
  symbol: string;
  exchange?: string;
  title: string;
  color?: string;
};

export function LiveChart({ symbol, exchange = 'NSE', title, color = '#F59E0B' }: LiveChartProps) {
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isLive, setIsLive] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setError(false);
      const res = await fetch(`/api/economy?symbol=${symbol}&exchange=${exchange}&interval=5min`);
      if (!res.ok) throw new Error('API error');
      const json = await res.json();
      const formatted = json.series.slice(-30).map((p: { time: string; value: number }) => ({
        time: new Date(p.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        value: p.value,
      }));
      setData(formatted);
      setIsLive(json.source === 'live');
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [symbol, exchange]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const firstVal = data[0]?.value ?? 0;
  const lastVal = data[data.length - 1]?.value ?? 0;
  const isUp = lastVal >= firstVal;
  const chartColor = isUp ? '#22C55E' : '#EF4444';
  const gradientId = `gradient-${symbol.replace('/', '-')}`;

  if (loading) {
    return (
      <div className="shimmer-loading rounded-xl" style={{ height: '200px' }} />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="card-base p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-mono font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
            {title}
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            {data.length > 0 && (
              <span className="text-lg font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
                ₹{lastVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            )}
            {data.length > 1 && (
              <span
                className="text-xs font-mono font-semibold"
                style={{ color: isUp ? 'var(--accent-green)' : 'var(--accent-red)' }}
              >
                {isUp ? '+' : ''}{((lastVal - firstVal) / firstVal * 100).toFixed(2)}%
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isLive ? (
            <span className="flex items-center gap-1 text-xs font-mono" style={{ color: 'var(--accent-green)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              LIVE
            </span>
          ) : (
            <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
              SIM
            </span>
          )}
          <button
            onClick={fetchData}
            className="p-1.5 rounded-lg transition-colors hover:opacity-70"
            style={{ color: 'var(--text-muted)', background: 'var(--bg-elevated)' }}
          >
            <RefreshCw size={12} />
          </button>
        </div>
      </div>

      {error ? (
        <div className="flex items-center justify-center h-32 text-sm" style={{ color: 'var(--text-muted)' }}>
          Chart unavailable
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 9, fill: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 9, fill: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}
              tickLine={false}
              axisLine={false}
              domain={['auto', 'auto']}
              tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v.toFixed(1)}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={firstVal}
              stroke="rgba(255,255,255,0.1)"
              strokeDasharray="4 4"
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={chartColor}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{ r: 4, fill: chartColor, stroke: 'var(--bg-card)', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
}
