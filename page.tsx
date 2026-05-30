'use client';
import { Navbar } from '@/components/layout/Navbar';
import { TickerTape } from '@/components/dashboard/TickerTape';
import { LiveChart } from '@/components/charts/LiveChart';
import { SectorRadar } from '@/components/charts/SectorRadar';
import { NewsFeed } from '@/components/dashboard/NewsFeed';
import { motion } from 'framer-motion';
import '@/i18n/config';

const CHARTS = [
  { symbol: 'NIFTY50', exchange: 'NSE', title: 'NIFTY 50' },
  { symbol: 'SENSEX', exchange: 'BSE', title: 'SENSEX' },
  { symbol: 'BANKNIFTY', exchange: 'NSE', title: 'Bank NIFTY' },
  { symbol: 'NIFTYIT', exchange: 'NSE', title: 'NIFTY IT' },
  { symbol: 'USD/INR', exchange: 'NSE', title: 'USD/INR' },
  { symbol: 'CNXPHARMA', exchange: 'NSE', title: 'NIFTY Pharma' },
];

export default function MarketsPage() {
  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar />
      <TickerTape />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="font-display font-black text-3xl" style={{ color: 'var(--text-primary)' }}>
            Live <span className="text-gradient-amber">Markets</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Real-time Indian market data — NIFTY, Sensex, sectors & more
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {CHARTS.map((c, i) => (
            <motion.div
              key={c.symbol}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <LiveChart {...c} />
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SectorRadar />
          <NewsFeed />
        </div>
      </div>
    </div>
  );
}
