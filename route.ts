import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.0-flash';

// Realistic fallback with current approximate Indian market sector data (May 2026)
const FALLBACK_SECTOR_DATA = [
  { name: 'Banking', nameHi: 'बैंकिंग', growth: 0.85, risk: 'Medium', momentum: 'Bullish', cap: '₹21.2T', shares: 'HDFCBANK, ICICIBANK, SBIN', pct: 28.4 },
  { name: 'IT', nameHi: 'सूचना प्रौद्योगिकी', growth: 1.20, risk: 'Medium', momentum: 'Bullish', cap: '₹25.8T', shares: 'TCS, INFY, WIPRO', pct: 15.3 },
  { name: 'Pharma', nameHi: 'फार्मा', growth: 0.45, risk: 'Low', momentum: 'Neutral', cap: '₹7.9T', shares: 'SUNPHARMA, DRREDDY, CIPLA', pct: 5.1 },
  { name: 'Auto/EV', nameHi: 'ऑटो/EV', growth: 1.80, risk: 'Medium', momentum: 'Bullish', cap: '₹11.2T', shares: 'MARUTI, TATAMOTORS, M&M', pct: 7.8 },
  { name: 'Real Estate', nameHi: 'रियल एस्टेट', growth: 2.10, risk: 'High', momentum: 'Strongly Bullish', cap: '₹5.6T', shares: 'DLF, GODREJPROP, OBEROIRLTY', pct: 3.2 },
  { name: 'AI & Tech', nameHi: 'AI और टेक', growth: 2.90, risk: 'High', momentum: 'Strongly Bullish', cap: '₹14.1T', shares: 'TCS, HCLTECH, LTIM', pct: 9.4 },
  { name: 'FMCG', nameHi: 'FMCG', growth: 0.30, risk: 'Low', momentum: 'Neutral', cap: '₹16.3T', shares: 'HINDUNILVR, ITC, NESTLEIND', pct: 9.2 },
  { name: 'Metal', nameHi: 'धातु', growth: -0.60, risk: 'High', momentum: 'Bearish', cap: '₹6.2T', shares: 'TATASTEEL, JSWSTEEL, HINDALCO', pct: 3.8 },
  { name: 'Energy', nameHi: 'ऊर्जा', growth: 0.55, risk: 'Medium', momentum: 'Neutral', cap: '₹19.7T', shares: 'RELIANCE, ONGC, NTPC', pct: 13.5 },
  { name: 'Infra', nameHi: 'बुनियादी ढांचा', growth: 1.40, risk: 'Medium', momentum: 'Bullish', cap: '₹4.8T', shares: 'LT, ADANIPORTS, POWERGRID', pct: 4.3 },
];

async function fetchSectorDataFromGemini() {
  if (!GEMINI_API_KEY) throw new Error('No Gemini key');

  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const prompt = `Today is ${today}. You are a real-time Indian stock market data assistant.

Provide CURRENT sector performance data for NSE India sectors as of today. Return ONLY a valid JSON array with no markdown, no explanation, no code fences.

Each object must have these exact fields:
- name: sector name in English
- nameHi: sector name in Hindi (Devanagari)
- growth: today's % change as a number (can be negative, e.g. -0.8 or 1.2)
- risk: "Low", "Medium", or "High"
- momentum: "Bearish", "Neutral", "Bullish", or "Strongly Bullish"
- cap: approximate market cap in Indian notation e.g. "₹21.5T"
- shares: top 3 NSE stock symbols for this sector, comma-separated
- pct: approximate % weight in NIFTY 500 index as a number

Sectors to include: Banking, IT, Pharma, Auto/EV, Real Estate, AI & Tech, FMCG, Metal, Energy, Infra

Base your numbers on actual recent market performance. Return only the JSON array.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1500,
      },
    }),
    next: { revalidate: 300 }, // cache 5 min
  });

  if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty Gemini response');

  // Strip any markdown fences if present
  const cleaned = text.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(cleaned);

  if (!Array.isArray(parsed) || parsed.length < 5) throw new Error('Invalid sector array');

  // Validate & clamp each entry
  return parsed.map((s: {
    name?: string; nameHi?: string; growth?: number; risk?: string;
    momentum?: string; cap?: string; shares?: string; pct?: number;
  }) => ({
    name: s.name || 'Unknown',
    nameHi: s.nameHi || s.name || 'Unknown',
    growth: typeof s.growth === 'number' ? Math.max(-15, Math.min(15, s.growth)) : 0,
    risk: ['Low', 'Medium', 'High'].includes(s.risk || '') ? s.risk : 'Medium',
    momentum: ['Bearish', 'Neutral', 'Bullish', 'Strongly Bullish'].includes(s.momentum || '') ? s.momentum : 'Neutral',
    cap: s.cap || '₹0T',
    shares: s.shares || '',
    pct: typeof s.pct === 'number' ? s.pct : 0,
  }));
}

export async function GET() {
  let sectors = FALLBACK_SECTOR_DATA;
  let source = 'fallback';

  try {
    sectors = await fetchSectorDataFromGemini();
    source = 'gemini-live';
  } catch (err) {
    console.warn('Gemini sector fetch failed, using fallback:', err);
  }

  return NextResponse.json({
    sectors,
    source,
    timestamp: new Date().toISOString(),
  });
}
