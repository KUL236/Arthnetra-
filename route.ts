import { NextRequest, NextResponse } from 'next/server';

const TWELVE_DATA_KEY = process.env.TWELVE_DATA_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.0-flash';

// Updated realistic fallback (May 2026)
const FALLBACK_CHARTS: Record<string, { base: number; volatility: number }> = {
  NIFTY50:   { base: 25120, volatility: 0.3 },
  SENSEX:    { base: 82340, volatility: 0.3 },
  'USD/INR': { base: 84.18, volatility: 0.05 },
  GOLD:      { base: 96500, volatility: 0.2 },
  BANKNIFTY: { base: 55400, volatility: 0.4 },
};

function generateFallbackTimeSeries(basePrice: number, points: number, volatility: number) {
  const data = [];
  let price = basePrice;
  const now = Date.now();
  for (let i = points; i >= 0; i--) {
    const change = (Math.random() - 0.48) * volatility;
    price = Math.max(price * (1 + change / 100), 1);
    data.push({
      time: new Date(now - i * 5 * 60 * 1000).toISOString(),
      value: Math.round(price * 100) / 100,
      open: Math.round(price * (1 - Math.random() * 0.002) * 100) / 100,
      close: Math.round(price * 100) / 100,
      high: Math.round(price * (1 + Math.random() * 0.003) * 100) / 100,
      low: Math.round(price * (1 - Math.random() * 0.003) * 100) / 100,
    });
  }
  return data;
}

// Use Gemini to get a realistic intraday price series when TwelveData fails
async function getGeminiTimeSeries(symbol: string, interval: string): Promise<{ time: string; value: number }[] | null> {
  if (!GEMINI_API_KEY) return null;
  try {
    const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    const prompt = `Today is ${today}. Generate a realistic intraday price series for NSE symbol "${symbol}" at ${interval} intervals for the last trading session.
Return ONLY a JSON array of 30 objects: [{"time":"HH:MM","value":NUMBER}, ...] — no markdown, no explanation.
Base the prices on realistic current market levels for this instrument.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 800 },
      }),
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;
    const cleaned = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed) || parsed.length < 10) return null;
    // Normalize time to ISO format
    const baseDate = new Date();
    baseDate.setHours(9, 15, 0, 0);
    return parsed.map((p: { time?: string; value?: number }, i: number) => ({
      time: p.time
        ? `${new Date().toISOString().split('T')[0]}T${p.time}:00`
        : new Date(baseDate.getTime() + i * 5 * 60000).toISOString(),
      value: typeof p.value === 'number' ? p.value : 0,
    }));
  } catch { return null; }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol') || 'NIFTY50';
  const interval = searchParams.get('interval') || '5min';
  const exchange = searchParams.get('exchange') || 'NSE';

  // 1. Try TwelveData
  try {
    const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=${interval}&outputsize=50&exchange=${exchange}&apikey=${TWELVE_DATA_KEY}`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    if (data.status === 'error' || !data.values) throw new Error('No data');
    const series = data.values.reverse().map((v: { datetime: string; open: string; high: string; low: string; close: string }) => ({
      time: v.datetime,
      value: parseFloat(v.close),
      open: parseFloat(v.open),
      high: parseFloat(v.high),
      low: parseFloat(v.low),
      close: parseFloat(v.close),
    }));
    return NextResponse.json({ symbol, series, source: 'live' });
  } catch { /* fall through */ }

  // 2. Try Gemini for realistic simulated data
  const geminiSeries = await getGeminiTimeSeries(symbol, interval);
  if (geminiSeries) {
    return NextResponse.json({ symbol, series: geminiSeries, source: 'gemini-sim' });
  }

  // 3. Pure fallback simulation
  const fallback = FALLBACK_CHARTS[symbol] || { base: 1000, volatility: 0.3 };
  return NextResponse.json({
    symbol,
    series: generateFallbackTimeSeries(fallback.base, 50, fallback.volatility),
    source: 'simulated',
  });
}
