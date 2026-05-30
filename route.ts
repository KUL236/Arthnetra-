import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const GEMINI_MODEL = 'gemini-2.0-flash';

const SYSTEM_PROMPT = `You are ArthNetra AI — India's most intelligent financial mentor and guide. 
You help Indians understand money, investments, banking, and the economy.

CORE RULES:
1. NEVER provide specific real-time stock prices — you don't have live data access
2. Always explain in simple, relatable terms using Indian examples (chai, autorickshaw, daal-roti analogies welcome)
3. Support BOTH Hindi and English — if user writes in Hindi, respond in Hindi; if English, respond in English
4. Be warm, educational, and empowering — not intimidating
5. Always mention risk and suggest diversification
6. For investment questions, always clarify the user's risk tolerance and time horizon matters
7. Mention SEBI, RBI, and regulatory frameworks when relevant
8. Use ₹ symbol for Indian Rupees
9. Keep responses concise but complete — mobile-friendly length
10. Structure responses with clear sections when explaining complex topics

Your personality: Wise elder + modern AI — like a knowledgeable CA uncle who speaks plainly.

Topics you excel at:
- SIP, Mutual Funds, FD, PPF, NPS, ELSS
- Stock market basics and sectors
- IPO investment guidance
- Gold vs Stocks vs FD comparisons
- Tax saving under 80C, capital gains
- RBI policies and their impact
- Inflation and its effects on savings
- Budget planning and emergency funds
- Insurance basics (term, health)
- Digital payments and fintech in India

Always end with a motivational but realistic note about financial discipline.`;

// ── Gemini (primary) ────────────────────────────────────────────────
async function callGemini(messages: { role: string; content: string }[], langInstruction: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  // Build Gemini contents array (no system role — prepend to first user message)
  const systemText = `${SYSTEM_PROMPT}\n\n${langInstruction}`;
  const contents = messages.map((m, i) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: i === 0 && m.role === 'user' ? `${systemText}\n\n${m.content}` : m.content }],
  }));

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini error: ${err}`);
  }

  const data = await res.json();
  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!reply) throw new Error('Gemini returned empty response');
  return reply;
}

// ── Groq (fallback) ─────────────────────────────────────────────────
async function callGroq(messages: { role: string; content: string }[], langInstruction: string): Promise<string> {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: `${SYSTEM_PROMPT}\n\n${langInstruction}` },
        ...messages,
      ],
      max_tokens: 1024,
      temperature: 0.7,
      stream: false,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq error: ${err}`);
  }

  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content;
  if (!reply) throw new Error('Groq returned empty response');
  return reply;
}

// ── Route Handler ───────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const { message, language, conversationHistory } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const langInstruction = language === 'hi'
      ? 'The user prefers Hindi. Please respond in Hindi (Devanagari script).'
      : 'The user prefers English. Please respond in English.';

    const history = (conversationHistory || []).slice(-6);
    const messages = [...history, { role: 'user', content: message }];

    let reply: string | null = null;
    let usedModel = '';

    // Try Gemini first
    if (GEMINI_API_KEY) {
      try {
        reply = await callGemini(messages, langInstruction);
        usedModel = GEMINI_MODEL;
      } catch (geminiErr) {
        console.warn('Gemini failed, falling back to Groq:', geminiErr);
      }
    }

    // Fall back to Groq
    if (!reply && GROQ_API_KEY) {
      try {
        reply = await callGroq(messages, langInstruction);
        usedModel = GROQ_MODEL;
      } catch (groqErr) {
        console.error('Groq also failed:', groqErr);
      }
    }

    if (!reply) {
      return NextResponse.json({
        error: 'AI service temporarily unavailable',
        fallback: language === 'hi'
          ? 'माफ़ करें, AI सेवा अभी उपलब्ध नहीं है। कृपया पुनः प्रयास करें।'
          : 'AI service is temporarily unavailable. Please try again shortly.',
      }, { status: 503 });
    }

    return NextResponse.json({ reply, model: usedModel });
  } catch (err) {
    console.error('AI chat error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
