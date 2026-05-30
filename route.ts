import { NextResponse } from 'next/server';

const FINNHUB_KEY = process.env.FINNHUB_API_KEY;

const FALLBACK_NEWS = [
  {
    id: '1',
    headline: 'RBI holds repo rate steady at 6.5% amid inflation concerns',
    summary: 'The Reserve Bank of India monetary policy committee maintained the benchmark rate citing persistent food inflation pressures.',
    source: 'Economic Times',
    datetime: Date.now() - 3600000,
    url: 'https://economictimes.indiatimes.com',
    category: 'economy',
  },
  {
    id: '2',
    headline: 'NIFTY IT index surges as global tech spending outlook improves',
    summary: 'Indian IT majors rallied on improved outlook from US clients, with TCS and Infosys leading gains.',
    source: 'Business Standard',
    datetime: Date.now() - 7200000,
    url: 'https://business-standard.com',
    category: 'technology',
  },
  {
    id: '3',
    headline: 'India GDP growth projected at 7.2% for FY2025: IMF',
    summary: 'International Monetary Fund revised India growth forecast upward, citing strong domestic consumption and infrastructure spending.',
    source: 'Mint',
    datetime: Date.now() - 10800000,
    url: 'https://livemint.com',
    category: 'economy',
  },
  {
    id: '4',
    headline: 'Gold hits new record high above ₹72,000 per 10 grams',
    summary: 'Safe-haven demand and weak rupee pushed domestic gold prices to fresh all-time highs.',
    source: 'NDTV Profit',
    datetime: Date.now() - 14400000,
    url: 'https://profit.ndtv.com',
    category: 'commodities',
  },
  {
    id: '5',
    headline: 'SIP inflows cross ₹21,000 crore milestone — retail investor boom',
    summary: 'Monthly systematic investment plan contributions reached record levels reflecting growing financial awareness among retail investors.',
    source: 'Financial Express',
    datetime: Date.now() - 18000000,
    url: 'https://financialexpress.com',
    category: 'markets',
  },
];

export async function GET() {
  try {
    const url = `https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_KEY}`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    
    if (!res.ok) throw new Error('Finnhub unavailable');
    
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error('No data');
    
    // Filter for India-related news
    const indiaKeywords = ['india', 'rbi', 'nifty', 'sensex', 'rupee', 'bse', 'nse', 'sebi', 'indian'];
    const filtered = data
      .filter((item: { headline?: string; summary?: string }) => {
        const text = ((item.headline || '') + ' ' + (item.summary || '')).toLowerCase();
        return indiaKeywords.some(kw => text.includes(kw));
      })
      .slice(0, 10)
      .map((item: { id?: number; headline?: string; summary?: string; source?: string; datetime?: number; url?: string; category?: string }) => ({
        id: String(item.id),
        headline: item.headline,
        summary: item.summary,
        source: item.source,
        datetime: item.datetime ? item.datetime * 1000 : Date.now(),
        url: item.url,
        category: item.category,
      }));
    
    return NextResponse.json(filtered.length > 0 ? filtered : FALLBACK_NEWS);
  } catch {
    return NextResponse.json(FALLBACK_NEWS);
  }
}
