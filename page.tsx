'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Navbar } from '@/components/layout/Navbar';
import { TickerTape } from '@/components/dashboard/TickerTape';
import { StatCard } from '@/components/dashboard/StatCard';
import { LiveChart } from '@/components/charts/LiveChart';
import { SectorRadar } from '@/components/charts/SectorRadar';
import { AIChat } from '@/components/dashboard/AIChat';
import { NewsFeed } from '@/components/dashboard/NewsFeed';
import { WealthSimulator } from '@/components/dashboard/WealthSimulator';
import { InvestmentComparison } from '@/components/dashboard/InvestmentComparison';
import { MoneyRadarScore } from '@/components/dashboard/MoneyRadarScore';
import { IndiaWealthRank } from '@/components/dashboard/IndiaWealthRank';
import { SIPMagicCalculator } from '@/components/dashboard/SIPMagicCalculator';
import { FearGreedIndex } from '@/components/dashboard/FearGreedIndex';
import { IndiaStateHeatMap } from '@/components/dashboard/IndiaStateHeatMap';
import { TrendingUp, Landmark, BarChart3, Globe2, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import '@/i18n/config';

type MarketData = {
  indices: {
    nifty: { price: number; change: number; changePct: number; high: number; low: number };
    sensex: { price: number; change: number; changePct: number; high: number; low: number };
  };
  forex: {
    usdinr: { price: number; change: number; changePct: number };
  };
  commodities: {
    gold: { price: number; change: number; changePct: number };
  };
  economy: { repoRate: number; inflation: number };
  timestamp: string;
};

export default function HomePage() {
  const { t } = useTranslation();
  const [market, setMarket] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarket = async () => {
      try {
        const res = await fetch('/api/market');
        if (res.ok) {
          const data = await res.json();
          setMarket(data);
        }
      } catch { /* use nulls */ }
      finally { setLoading(false); }
    };
    fetchMarket();
    const interval = setInterval(fetchMarket, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-8 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full opacity-5 blur-3xl animate-orb-pulse"
            style={{ background: 'radial-gradient(circle, #F59E0B, transparent)' }}
          />
          <div
            className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full opacity-3 blur-3xl animate-orb-pulse"
            style={{ background: 'radial-gradient(circle, #DC143C, transparent)', animationDelay: '1.5s' }}
          />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage: `linear-gradient(var(--accent-amber) 1px, transparent 1px), linear-gradient(90deg, var(--accent-amber) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-10"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6"
              style={{
                borderColor: 'var(--accent-amber-border)',
                background: 'var(--accent-amber-glow)',
                color: 'var(--accent-amber)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-mono font-semibold">AI-POWERED • REAL-TIME • BILINGUAL</span>
            </motion.div>

            <h1
              className="font-display font-black mb-4 leading-tight"
              style={{
                fontSize: 'clamp(2rem, 6vw, 4.5rem)',
                color: 'var(--text-primary)',
              }}
            >
              <span className="text-gradient-amber">ArthNetra</span>
              <br />
              <span style={{ color: 'var(--text-primary)', fontSize: '0.65em', fontWeight: '600' }}>
                {t('hero.tagline')}
              </span>
            </h1>

            <p
              className="max-w-2xl mx-auto mb-8"
              style={{
                color: 'var(--text-secondary)',
                fontSize: 'clamp(0.85rem, 2vw, 1.05rem)',
                lineHeight: '1.7',
              }}
            >
              {t('hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="#dashboard"
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105"
                style={{ background: 'var(--accent-amber)', color: '#000' }}
              >
                {t('hero.cta')}
                <ArrowRight size={16} />
              </Link>
              <Link
                href="#ai-mentor"
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105"
                style={{
                  border: '1px solid var(--border-accent)',
                  color: 'var(--text-primary)',
                  background: 'var(--accent-amber-glow)',
                }}
              >
                {t('hero.ctaSecondary')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Ticker Tape */}
      <TickerTape />

      {/* Main Dashboard */}
      <div id="dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Section header */}
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--accent-amber-glow)', color: 'var(--accent-amber)' }}
          >
            <BarChart3 size={16} />
          </div>
          <h2 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            {t('dashboard.title')}
          </h2>
          <span className="flex items-center gap-1 text-xs font-mono ml-auto" style={{ color: 'var(--accent-green)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            {t('dashboard.live')}
          </span>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="shimmer-loading rounded-xl h-24" />
            ))
          ) : (
            <>
              <StatCard
                title={t('dashboard.nifty')}
                value={`₹${market?.indices.nifty.price.toLocaleString('en-IN') || '--'}`}
                changePct={market?.indices.nifty.changePct}
                change={market?.indices.nifty.change}
                isLive
                delay={0}
                icon={<TrendingUp size={14} />}
              />
              <StatCard
                title={t('dashboard.sensex')}
                value={market?.indices.sensex.price.toLocaleString('en-IN') || '--'}
                changePct={market?.indices.sensex.changePct}
                change={market?.indices.sensex.change}
                isLive
                delay={0.05}
                icon={<BarChart3 size={14} />}
              />
              <StatCard
                title={t('dashboard.gold')}
                value={`₹${market?.commodities.gold.price.toLocaleString('en-IN') || '--'}`}
                changePct={market?.commodities.gold.changePct}
                change={market?.commodities.gold.change}
                delay={0.1}
                icon={<span style={{ fontSize: '14px' }}>🪙</span>}
              />
              <StatCard
                title={t('dashboard.rupee')}
                value={`₹${market?.forex.usdinr.price.toFixed(2) || '--'}`}
                changePct={market?.forex.usdinr.changePct}
                change={market?.forex.usdinr.change}
                delay={0.15}
                icon={<Globe2 size={14} />}
              />
              <StatCard
                title={t('dashboard.repoRate')}
                value={`${market?.economy.repoRate || 6.5}%`}
                subtitle="RBI Policy Rate"
                delay={0.2}
                icon={<Landmark size={14} />}
              />
              <StatCard
                title={t('dashboard.inflation')}
                value={`${market?.economy.inflation || 4.83}%`}
                subtitle="CPI (Annual)"
                delay={0.25}
                icon={<span style={{ fontSize: '14px' }}>📊</span>}
              />
            </>
          )}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LiveChart symbol="NIFTY50" exchange="NSE" title="NIFTY 50" />
          <LiveChart symbol="SENSEX" exchange="BSE" title="SENSEX" />
        </div>

        {/* Sector + News Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SectorRadar />
          <NewsFeed />
        </div>

        {/* More Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LiveChart symbol="USD/INR" exchange="NSE" title="USD/INR Exchange Rate" />
          <LiveChart symbol="BANKNIFTY" exchange="NSE" title="Bank NIFTY" />
        </div>

        {/* AI Mentor */}
        <div id="ai-mentor">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--accent-amber-glow)', color: 'var(--accent-amber)' }}
            >
              <span style={{ fontSize: '16px' }}>🤖</span>
            </div>
            <h2 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
              {t('aiMentor.title')}
            </h2>
          </div>
          <AIChat />
        </div>

        {/* Investment Comparison */}
        <InvestmentComparison />

        {/* ═══ NEW VIRAL FEATURES ═══ */}
        <div className="flex items-center gap-3 pt-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--accent-amber-glow)', color: 'var(--accent-amber)' }}
          >
            <Sparkles size={16} />
          </div>
          <h2 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            Financial Intelligence Suite
          </h2>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full ml-auto" style={{ background: 'var(--accent-amber-glow)', color: 'var(--accent-amber)', border: '1px solid var(--accent-amber-border)' }}>
            NEW
          </span>
        </div>

        {/* Money Radar Score */}
        <MoneyRadarScore />

        {/* India Wealth Rank */}
        <IndiaWealthRank />

        {/* SIP Magic Calculator */}
        <SIPMagicCalculator />

        {/* Fear & Greed + State Heat Map */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FearGreedIndex />
          <IndiaStateHeatMap />
        </div>

        {/* Wealth Simulator */}
        <WealthSimulator />

        {/* Footer */}
        <footer
          className="text-center py-8 border-t"
          style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="font-display font-bold" style={{ color: 'var(--accent-amber)' }}>
              ArthNetra
            </span>
            <span className="text-xs font-mono">v1.0</span>
          </div>
          <p className="text-xs max-w-md mx-auto">
            Disclaimer: This platform is for educational and informational purposes only.
            Not financial advice. Please consult a SEBI-registered advisor before investing.
            Data sourced from Twelve Data, Alpha Vantage, and Finnhub.
          </p>
          <p className="text-xs mt-2">
            अस्वीकरण: यह प्लेटफ़ॉर्म केवल शैक्षणिक उद्देश्यों के लिए है। वित्तीय सलाह नहीं।
          </p>
        </footer>
      </div>
    </div>
  );
}
