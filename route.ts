import { NextResponse } from 'next/server';

const TWELVE_DATA_KEY = process.env.TWELVE_DATA_API_KEY;
const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.0-flash';

// Current realistic fallback data (May 2026)
const FALLBACK_DATA = {
  nifty: { symbol: 'NIFTY 50', price: 25120.55, change: 182.30, changePct: 0.73, high: 25280.10, low: 24970.20 },
  sensex: { symbol: 'SENSEX', price: 82340.80, change: 540.60, changePct: 0.66, high: 82710.00, low: 81940.50 },
  gold: { symbol: 'Gold/INR', price: 96500, change: 420, changePct: 0.44, high: 97000, low: 96100 },
  usdinr: { symbol: 'USD/INR', price: 84.18, change: -0.08, changePct: -0.10, high: 84.30, low: 84.05 },
  repoRate: 6.25,
  inflation: 3.34,
};

const FALLBACK_SECTORS = [
  { name: 'Banking', price: 55400, change: 0.85, risk: 'Medium', shares: 'HDFCBANK, ICICIBANK, SBIN', pct: 28.4 },
  { name: 'IT', price: 41200, change: 1.20, risk: 'Medium', shares: 'TCS, INFY, WIPRO', pct: 15.3 },
  { name: 'Pharma', price: 20100, change: 0.45, risk: 'Low', shares: 'SUNPHARMA, DRREDDY, CIPLA', pct: 5.1 },
  { name: 'Auto/EV', price: 24800, change: 1.80, risk: 'Medium', shares: 'MARUTI, TATAMOTORS, M&M', pct: 7.8 },
  { name: 'Real Estate', price: 9200, change: 2.10, risk: 'High', shares: 'DLF, GODREJPROP, OBEROIRLTY', pct: 3.2 },
  { name: 'AI/Tech', price: 44300, change: 2.90, risk: 'High', shares: 'TCS, HCLTECH, LTIM', pct: 9.4 },
  { name: 'FMCG', price: 56100, change: 0.30, risk: 'Low', shares: 'HINDUNILVR, ITC, NESTLEIND', pct: 9.2 },
  { name: 'Metal', price: 8800, change: -0.60, risk: 'High', shares: 'TATASTEEL, JSWSTEEL, HINDALCO', pct: 3.8 },
  { name: 'Energy', price: 32400, change: 0.55, risk: 'Medium', shares: 'RELIANCE, ONGC, NTPC', pct: 13.5 },
  { name: 'Infra', price: 11600, change: 1.40, risk: 'Medium', shares: 'LT, ADANIPORTS, POWERGRID', pct: 4.3 },
];

async function fetchWithTimeout(url: string, timeout = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { signal: controller.signal, next: { revalidate: 60 } });
    clearTimeout(id);
    return res;
  } catch {
    clearTimeout(id);
    return null;
  }
}

async function getNifty() {
  try {
    const url = `https://api.twelvedata.com/quote?symbol=NIFTY50&exchange=NSE&apikey=${TWELVE_DATA_KEY}`;
    const res = await fetchWithTimeout(url);
    if (!res?.ok) return FALLBACK_DATA.nifty;
    const data = await res.json();
    if (data.status === 'error' || !data.close) return FALLBACK_DATA.nifty;
    return {
      symbol: 'NIFTY 50',
      price: parseFloat(data.close),
      change: parseFloat(data.change),
      changePct: parseFloat(data.percent_change),
      high: parseFloat(data.high),
      low: parseFloat(data.low),
    };
  } catch { return FALLBACK_DATA.nifty; }
}

async function getSensex() {
  try {
    const url = `https://api.twelvedata.com/quote?symbol=SENSEX&exchange=BSE&apikey=${TWELVE_DATA_KEY}`;
    const res = await fetchWithTimeout(url);
    if (!res?.ok) return FALLBACK_DATA.sensex;
    const data = await res.json();
    if (data.status === 'error' || !data.close) return FALLBACK_DATA.sensex;
    return {
      symbol: 'SENSEX',
      price: parseFloat(data.close),
      change: parseFloat(data.change),
      changePct: parseFloat(data.percent_change),
      high: parseFloat(data.high),
      low: parseFloat(data.low),
    };
  } catch { return FALLBACK_DATA.sensex; }
}

async function getGold() {
  try {
    const url = `https://www.alphavantage.co/query?function=FX_DAILY&from_symbol=XAU&to_symbol=INR&apikey=${ALPHA_VANTAGE_KEY}`;
    const res = await fetchWithTimeout(url);
    if (!res?.ok) return FALLBACK_DATA.gold;
    const data = await res.json();
    const timeSeries = data['Time Series FX (Daily)'];
    if (!timeSeries) return FALLBACK_DATA.gold;
    const latest = Object.keys(timeSeries)[0];
    const entry = timeSeries[latest];
    const price = parseFloat(entry['4. close']);
    const prev = Object.keys(timeSeries)[1];
    const prevPrice = parseFloat(timeSeries[prev]?.['4. close'] || price);
    return {
      symbol: 'Gold/INR',
      price: Math.round(price),
      change: Math.round(price - prevPrice),
      changePct: parseFloat(((price - prevPrice) / prevPrice * 100).toFixed(2)),
      high: parseFloat(entry['2. high']),
      low: parseFloat(entry['3. low']),
    };
  } catch { return FALLBACK_DATA.gold; }
}

async function getUSDINR() {
  try {
    const url = `https://api.twelvedata.com/quote?symbol=USD/INR&apikey=${TWELVE_DATA_KEY}`;
    const res = await fetchWithTimeout(url);
    if (!res?.ok) return FALLBACK_DATA.usdinr;
    const data = await res.json();
    if (data.status === 'error' || !data.close) return FALLBACK_DATA.usdinr;
    return {
      symbol: 'USD/INR',
      price: parseFloat(data.close),
      change: parseFloat(data.change),
      changePct: parseFloat(data.percent_change),
      high: parseFloat(data.high),
      low: parseFloat(data.low),
    };
  } catch { return FALLBACK_DATA.usdinr; }
}

// Use Gemini to get live sector data with real shares info
async function getSectorDataFromGemini() {
  if (!GEMINI_API_KEY) throw new Error('No Gemini key');

  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const prompt = `Today is ${today}. Return current NSE Indian sector data as a JSON array only — no markdown, no explanation.

Each item: { name, price, change, risk, shares, pct }
- name: sector name
- price: approximate NSE sector index price (number)
- change: today's % change (number, can be negative)
- risk: "Low", "Medium", or "High"
- shares: top 3 NSE stock symbols comma-separated
- pct: % weight in NIFTY 500 (number)

Sectors: Banking, IT, Pharma, Auto/EV, Real Estate, AI/Tech, FMCG, Metal, Energy, Infra

Return ONLY the JSON array.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 1000 },
    }),
    next: { revalidate: 300 },
  });

  if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response');

  const cleaned = text.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed) || parsed.length < 5) throw new Error('Bad array');

  return parsed.map((s: { name?: string; price?: number; change?: number; risk?: string; shares?: string; pct?: number }) => ({
    name: s.name || 'Unknown',
    price: typeof s.price === 'number' ? s.price : 10000,
    change: typeof s.change === 'number' ? Math.max(-15, Math.min(15, s.change)) : 0,
    risk: ['Low', 'Medium', 'High'].includes(s.risk || '') ? s.risk : 'Medium',
    shares: s.shares || '',
    pct: typeof s.pct === 'number' ? s.pct : 0,
  }));
}

// Also try TwelveData sector indices
async function getSectorDataFromTwelveData() {
  const sectors = [
    { name: 'Banking', symbol: 'BANKNIFTY', exchange: 'NSE', shares: 'HDFCBANK, ICICIBANK, SBIN', pct: 28.4 },
    { name: 'IT', symbol: 'NIFTYIT', exchange: 'NSE', shares: 'TCS, INFY, WIPRO', pct: 15.3 },
    { name: 'Pharma', symbol: 'CNXPHARMA', exchange: 'NSE', shares: 'SUNPHARMA, DRREDDY, CIPLA', pct: 5.1 },
    { name: 'Auto/EV', symbol: 'CNXAUTO', exchange: 'NSE', shares: 'MARUTI, TATAMOTORS, M&M', pct: 7.8 },
    { name: 'FMCG', symbol: 'CNXFMCG', exchange: 'NSE', shares: 'HINDUNILVR, ITC, NESTLEIND', pct: 9.2 },
    { name: 'Metal', symbol: 'CNXMETAL', exchange: 'NSE', shares: 'TATASTEEL, JSWSTEEL, HINDALCO', pct: 3.8 },
  ];

  const results = await Promise.all(
    sectors.map(async (s) => {
      try {
        const url = `https://api.twelvedata.com/quote?symbol=${s.symbol}&exchange=${s.exchange}&apikey=${TWELVE_DATA_KEY}`;
        const res = await fetchWithTimeout(url, 4000);
        if (!res?.ok) return null;
        const data = await res.json();
        if (data.status === 'error' || !data.close) return null;
        return {
          name: s.name,
          price: parseFloat(data.close),
          change: parseFloat(data.percent_change),
          risk: 'Medium' as const,
          shares: s.shares,
          pct: s.pct,
        };
      } catch { return null; }
    })
  );

  const valid = results.filter(Boolean);
  return valid.length >= 4 ? valid : null;
}

export async function GET() {
  const [nifty, sensex, gold, usdinr] = await Promise.all([
    getNifty(), getSensex(), getGold(), getUSDINR(),
  ]);

  // Try TwelveData sectors first (actual live prices), then Gemini, then fallback
  let sectors = FALLBACK_SECTORS;
  let sectorSource = 'fallback';

  try {
    const twelveResult = await getSectorDataFromTwelveData();
    if (twelveResult && twelveResult.length >= 4) {
      // Fill missing sectors from fallback
      const names = (twelveResult as { name: string }[]).map(s => s.name);
      const missing = FALLBACK_SECTORS.filter(s => !names.includes(s.name));
      sectors = [...(twelveResult as typeof FALLBACK_SECTORS), ...missing];
      sectorSource = 'twelvedata-live';
    } else {
      throw new Error('TwelveData insufficient');
    }
  } catch {
    // Try Gemini for sector data
    try {
      const geminiSectors = await getSectorDataFromGemini();
      sectors = geminiSectors as typeof FALLBACK_SECTORS;
      sectorSource = 'gemini-live';
    } catch (err) {
      console.warn('All sector sources failed, using fallback:', err);
    }
  }

  return NextResponse.json({
    indices: { nifty, sensex },
    forex: { usdinr },
    commodities: { gold },
    economy: {
      repoRate: FALLBACK_DATA.repoRate,
      inflation: FALLBACK_DATA.inflation,
    },
    sectors,
    sectorSource,
    timestamp: new Date().toISOString(),
  });
}
