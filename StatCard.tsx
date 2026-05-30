'use client';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

type StatCardProps = {
  title: string;
  value: string;
  change?: number;
  changePct?: number;
  subtitle?: string;
  isLive?: boolean;
  delay?: number;
  icon?: React.ReactNode;
  badge?: string;
};

export function StatCard({
  title,
  value,
  change,
  changePct,
  subtitle,
  isLive = false,
  delay = 0,
  icon,
  badge,
}: StatCardProps) {
  const isPositive = (changePct ?? change ?? 0) >= 0;
  const isNeutral = change === undefined && changePct === undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="card-base p-4 relative overflow-hidden cursor-pointer select-none"
    >
      {/* Background glow */}
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-5 pointer-events-none"
        style={{
          background: isNeutral
            ? 'var(--accent-amber)'
            : isPositive
            ? 'var(--accent-green)'
            : 'var(--accent-red)',
          filter: 'blur(20px)',
        }}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon && (
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--accent-amber-glow)', color: 'var(--accent-amber)' }}
            >
              {icon}
            </div>
          )}
          <div>
            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
              {title}
            </p>
            {badge && (
              <span
                className="text-xs px-1.5 py-0.5 rounded font-mono"
                style={{ background: 'var(--accent-amber-glow)', color: 'var(--accent-amber)' }}
              >
                {badge}
              </span>
            )}
          </div>
        </div>

        {isLive && (
          <span className="flex items-center gap-1 text-xs font-mono" style={{ color: 'var(--accent-green)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            LIVE
          </span>
        )}
      </div>

      {/* Value */}
      <div className="mb-2">
        <p
          className="text-2xl font-mono font-bold tracking-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          {value}
        </p>
      </div>

      {/* Change */}
      {!isNeutral && (
        <div className="flex items-center gap-2">
          <span
            className="flex items-center gap-1 text-sm font-mono font-semibold"
            style={{ color: isPositive ? 'var(--accent-green)' : 'var(--accent-red)' }}
          >
            {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {isPositive ? '+' : ''}{changePct?.toFixed(2)}%
          </span>
          {change !== undefined && (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              ({isPositive ? '+' : ''}{change > 1000 ? change.toLocaleString('en-IN') : change.toFixed(2)})
            </span>
          )}
        </div>
      )}

      {subtitle && (
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          {subtitle}
        </p>
      )}

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5 opacity-40"
        style={{
          background: isNeutral
            ? 'var(--accent-amber)'
            : isPositive
            ? 'var(--accent-green)'
            : 'var(--accent-red)',
        }}
      />
    </motion.div>
  );
}
