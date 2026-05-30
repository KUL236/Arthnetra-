'use client';
import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

type TickerItem = {
  symbol: string;
  price: number;
  change: number;
  changePct: number;
};

const FALLBACK: TickerItem[] = [
  { symbol: 'NIFTY 50', price: 24500, change: 145, changePct: 0.6 },
  { symbol: 'SENSEX', price: 80450, change: 480, changePct: 0.6 },
  { symbol: 'BANKNIFTY', price: 52300, change: -120, changePct: -0.23 },
  { symbol: 'GOLD', price: 72450, change: 320, changePct: 0.44 },
  { symbol: 'USD/INR', price: 83.52, change: -0.12, changePct: -0.14 },
  { symbol: 'TCS', price: 3850, change: 42, changePct: 1.1 },
  { symbol: 'INFOSYS', price: 1580, change: -15, changePct: -0.94 },
  { symbol: 'RELIANCE', price: 2890, change: 35, changePct: 1.22 },
  { symbol: 'HDFC BANK', price: 1710, change: 22, changePct: 1.3 },
];

export function TickerTape() {
  const [items, setItems] = useState<TickerItem[]>(FALLBACK);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/market');
        if (!res.ok) return;
        const data = await res.json();
        const live: TickerItem[] = [
          { symbol: 'NIFTY 50', ...data.indices.nifty },
          { symbol: 'SENSEX', ...data.indices.sensex },
          { symbol: 'GOLD', ...data.commodities.gold },
          { symbol: 'USD/INR', ...data.forex.usdinr },
          ...FALLBACK.slice(4),
        ];
        setItems(live);
      } catch { /* use fallback */ }
    };
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const doubled = [...items, ...items];

  return (
    <div
      className="w-full overflow-hidden border-b py-2"
      style={{
        background: 'var(--bg-secondary)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      <div className="ticker-inner">
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-2 mx-6 text-xs font-mono">
            <span style={{ color: 'var(--text-secondary)' }} className="font-semibold">
              {item.symbol}
            </span>
            <span style={{ color: 'var(--text-primary)' }}>
              {item.symbol.includes('/') || item.symbol === 'USD/INR'
                ? item.price.toFixed(2)
                : item.price >= 1000
                ? `₹${item.price.toLocaleString('en-IN')}`
                : `₹${item.price.toFixed(2)}`}
            </span>
            <span
              className="flex items-center gap-0.5"
              style={{ color: item.changePct >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}
            >
              {item.changePct >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {item.changePct >= 0 ? '+' : ''}{item.changePct.toFixed(2)}%
            </span>
            <span style={{ color: 'var(--border-accent)' }} className="ml-2">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}
