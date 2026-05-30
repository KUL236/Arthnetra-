'use client';
import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Clock, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type NewsItem = {
  id: string;
  headline: string;
  summary: string;
  source: string;
  datetime: number;
  url: string;
  category: string;
};

const CATEGORY_COLORS: Record<string, string> = {
  economy: '#F59E0B',
  technology: '#8B5CF6',
  markets: '#22C55E',
  commodities: '#F97316',
  banking: '#06B6D4',
  default: '#6B7280',
};

export function NewsFeed() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchNews = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await fetch('/api/news', { cache: 'no-store' });
      if (!res.ok) throw new Error('error');
      const data = await res.json();
      setNews(data);
      setLastUpdated(new Date());
    } catch { /* silently fail */ }
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
    const interval = setInterval(() => fetchNews(), 300000); // 5 min auto-refresh
    return () => clearInterval(interval);
  }, [fetchNews]);

  return (
    <div className="card-base p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>
          Market News
        </h3>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {formatDistanceToNow(lastUpdated, { addSuffix: true })}
            </span>
          )}
          <button
            onClick={() => fetchNews(true)}
            disabled={refreshing || loading}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105 disabled:opacity-50"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--accent-amber)',
            }}
            title="Refresh news"
          >
            <RefreshCw
              size={12}
              className={refreshing ? 'animate-spin' : ''}
            />
            {refreshing ? 'Updating...' : 'Refresh'}
          </button>
          <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
            <Clock size={12} />
            Live
          </span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="shimmer-loading rounded-lg h-16" />
          ))}
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {news.slice(0, 8).map((item, i) => {
            const catColor = CATEGORY_COLORS[item.category?.toLowerCase()] || CATEGORY_COLORS.default;
            return (
              <motion.a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex gap-3 p-3 rounded-xl transition-all hover:scale-[1.01] cursor-pointer block"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  textDecoration: 'none',
                }}
              >
                <div
                  className="w-1 rounded-full flex-shrink-0"
                  style={{ background: catColor, minHeight: '40px' }}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className="text-xs font-semibold leading-snug line-clamp-2 mb-1"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {item.headline}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="text-xs px-1.5 py-0.5 rounded"
                      style={{ background: `${catColor}20`, color: catColor }}
                    >
                      {item.category || 'news'}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {item.source}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {formatDistanceToNow(new Date(item.datetime), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <ExternalLink size={12} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: 2 }} />
              </motion.a>
            );
          })}
        </div>
      )}
    </div>
  );
}
