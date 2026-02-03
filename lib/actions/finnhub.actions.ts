'use server';

import { getDateRange, validateArticle, formatArticle } from '@/lib/utils';
import { POPULAR_STOCK_SYMBOLS } from '@/lib/constants';
import { cache } from 'react';

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const NEXT_PUBLIC_FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY ?? '';

async function fetchJSON<T>(url: string, revalidateSeconds?: number): Promise<T> {
  const options: RequestInit & { next?: { revalidate?: number } } = revalidateSeconds
    ? { cache: 'force-cache', next: { revalidate: revalidateSeconds } }
    : { cache: 'no-store' };

  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Fetch failed ${res.status}: ${text}`);
  }
  return (await res.json()) as T;
}

export { fetchJSON };

// Get current stock quote (price) for a symbol
export async function getStockQuote(symbol: string): Promise<{ c: number; h: number; l: number; o: number; pc: number } | null> {
  try {
    const token = process.env.FINNHUB_API_KEY ?? NEXT_PUBLIC_FINNHUB_API_KEY;
    if (!token) {
      console.error('FINNHUB API key is not configured');
      return null;
    }
    const url = `${FINNHUB_BASE_URL}/quote?symbol=${encodeURIComponent(symbol.toUpperCase())}&token=${token}`;
    const data = await fetchJSON<{ c: number; h: number; l: number; o: number; pc: number }>(url);
    // c = current price, h = high, l = low, o = open, pc = previous close
    if (!data || data.c === 0) return null;
    return data;
  } catch (err) {
    console.error('getStockQuote error:', symbol, err);
    return null;
  }
}

export async function getNews(symbols?: string[]): Promise<MarketNewsArticle[]> {
  try {
    const range = getDateRange(5);
    const token = process.env.FINNHUB_API_KEY ?? NEXT_PUBLIC_FINNHUB_API_KEY;
    if (!token) {
      throw new Error('FINNHUB API key is not configured');
    }
    const cleanSymbols = (symbols || [])
      .map((s) => s?.trim().toUpperCase())
      .filter((s): s is string => Boolean(s));

    const maxArticles = 6;

    // If we have symbols, try to fetch company news per symbol and round-robin select
    if (cleanSymbols.length > 0) {
      const perSymbolArticles: Record<string, RawNewsArticle[]> = {};

      await Promise.all(
        cleanSymbols.map(async (sym) => {
          try {
            const url = `${FINNHUB_BASE_URL}/company-news?symbol=${encodeURIComponent(sym)}&from=${range.from}&to=${range.to}&token=${token}`;
            const articles = await fetchJSON<RawNewsArticle[]>(url, 300);
            perSymbolArticles[sym] = (articles || []).filter(validateArticle);
          } catch (e) {
            console.error('Error fetching company news for', sym, e);
            perSymbolArticles[sym] = [];
          }
        })
      );

      const collected: MarketNewsArticle[] = [];
      // Round-robin up to 6 picks
      for (let round = 0; round < maxArticles; round++) {
        for (let i = 0; i < cleanSymbols.length; i++) {
          const sym = cleanSymbols[i];
          const list = perSymbolArticles[sym] || [];
          if (list.length === 0) continue;
          const article = list.shift();
          if (!article || !validateArticle(article)) continue;
          collected.push(formatArticle(article, true, sym, round));
          if (collected.length >= maxArticles) break;
        }
        if (collected.length >= maxArticles) break;
      }

      if (collected.length > 0) {
        // Sort by datetime desc
        collected.sort((a, b) => (b.datetime || 0) - (a.datetime || 0));
        return collected.slice(0, maxArticles);
      }
      // If none collected, fall through to general news
    }

    // General market news fallback or when no symbols provided
    const generalUrl = `${FINNHUB_BASE_URL}/news?category=general&token=${token}`;
    const general = await fetchJSON<RawNewsArticle[]>(generalUrl, 300);

    const seen = new Set<string>();
    const unique: RawNewsArticle[] = [];
    for (const art of general || []) {
      if (!validateArticle(art)) continue;
      const key = `${art.id}-${art.url}-${art.headline}`;
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(art);
      if (unique.length >= 20) break; // cap early before final slicing
    }

    const formatted = unique.slice(0, maxArticles).map((a, idx) => formatArticle(a, false, undefined, idx));
    return formatted;
  } catch (err) {
    console.error('getNews error:', err);
    throw new Error('Failed to fetch news');
  }
}

export const searchStocks = cache(async (query?: string): Promise<StockWithWatchlistStatus[]> => {
  try {
    const token = process.env.FINNHUB_API_KEY ?? NEXT_PUBLIC_FINNHUB_API_KEY;
    if (!token) {
      // If no token, log and return empty to avoid throwing per requirements
      console.error('Error in stock search:', new Error('FINNHUB API key is not configured'));
      return [];
    }

    const trimmed = typeof query === 'string' ? query.trim() : '';

    let results: FinnhubSearchResult[] = [];

    if (!trimmed) {
      // Fetch top 10 popular symbols' profiles
      const top = POPULAR_STOCK_SYMBOLS.slice(0, 10);
      const profiles = await Promise.all(
        top.map(async (sym) => {
          try {
            const url = `${FINNHUB_BASE_URL}/stock/profile2?symbol=${encodeURIComponent(sym)}&token=${token}`;
            // Revalidate every hour
            const profile = await fetchJSON<any>(url, 3600);
            return { sym, profile } as { sym: string; profile: any };
          } catch (e) {
            console.error('Error fetching profile2 for', sym, e);
            return { sym, profile: null } as { sym: string; profile: any };
          }
        })
      );

      results = profiles
        .map(({ sym, profile }) => {
          const symbol = sym.toUpperCase();
          const name: string | undefined = profile?.name || profile?.ticker || undefined;
          const exchange: string | undefined = profile?.exchange || undefined;
          if (!name) return undefined;
          const r: FinnhubSearchResult = {
            symbol,
            description: name,
            displaySymbol: symbol,
            type: 'Common Stock',
          };
          // We don't include exchange in FinnhubSearchResult type, so carry via mapping later using profile
          // To keep pipeline simple, attach exchange via closure map stage
          // We'll reconstruct exchange when mapping to final type
          (r as any).__exchange = exchange; // internal only
          return r;
        })
        .filter((x): x is FinnhubSearchResult => Boolean(x));
    } else {
      const url = `${FINNHUB_BASE_URL}/search?q=${encodeURIComponent(trimmed)}&token=${token}`;
      const data = await fetchJSON<FinnhubSearchResponse>(url, 1800);
      results = Array.isArray(data?.result) ? data.result : [];
    }

    const mapped: StockWithWatchlistStatus[] = results
      .map((r) => {
        const upper = (r.symbol || '').toUpperCase();
        const name = r.description || upper;
        const exchangeFromDisplay = (r.displaySymbol as string | undefined) || undefined;
        const exchangeFromProfile = (r as any).__exchange as string | undefined;
        const exchange = exchangeFromDisplay || exchangeFromProfile || 'US';
        const type = r.type || 'Stock';
        const item: StockWithWatchlistStatus = {
          symbol: upper,
          name,
          exchange,
          type,
          isInWatchlist: false,
        };
        return item;
      })
      .slice(0, 15);

    return mapped;
  } catch (err) {
    console.error('Error in stock search:', err);
    return [];
  }
});


export type SentimentResult = {
  sentiment: 'bullish' | 'bearish' | 'neutral';
  score: number; // 0-100
  summary: string;
};

// Analyze news sentiment using Groq API (FREE)
export async function analyzeNewsSentiment(symbol: string): Promise<SentimentResult | null> {
  try {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
      console.error('GROQ_API_KEY is not configured');
      return null;
    }

    // First, fetch news for this symbol
    const news = await getNews([symbol]);
    if (!news || news.length === 0) {
      return { sentiment: 'neutral', score: 50, summary: 'No recent news available for analysis.' };
    }

    // Prepare headlines for analysis
    const headlines = news.slice(0, 5).map(n => n.headline || n.summary).filter(Boolean);
    if (headlines.length === 0) {
      return { sentiment: 'neutral', score: 50, summary: 'No headlines available for analysis.' };
    }

    const prompt = `Analyze the sentiment of these news headlines for ${symbol} stock. Return ONLY a JSON object with these exact fields:
- sentiment: "bullish", "bearish", or "neutral"
- score: a number from 0 to 100 (0 = extremely bearish, 50 = neutral, 100 = extremely bullish)
- summary: a brief 1-sentence summary of the overall sentiment

Headlines:
${headlines.map((h, i) => `${i + 1}. ${h}`).join('\n')}

Return ONLY valid JSON, no markdown, no explanation.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'You are a financial analyst. Return only valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 200
      }),
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error('Groq API error:', response.status);
      return null;
    }


    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text) {
      return null;
    }

    // Parse JSON from response (handle potential markdown wrapping)
    // Clean the text first - remove markdown code blocks and extra content
    let cleanText = text.replace(/```json?\n?/g, '').replace(/```\n?/g, '').trim();

    const jsonMatch = cleanText.match(/\{[^{}]*"sentiment"[^{}]*"score"[^{}]*"summary"[^{}]*\}/);
    if (!jsonMatch) {
      // Try simpler match
      const simpleMatch = cleanText.match(/\{[\s\S]*?\}/);
      if (!simpleMatch) return null;
      cleanText = simpleMatch[0];
    } else {
      cleanText = jsonMatch[0];
    }

    let result: SentimentResult;
    try {
      result = JSON.parse(cleanText) as SentimentResult;
    } catch {
      console.error('Failed to parse sentiment JSON:', cleanText);
      return null;
    }

    // Validate result
    if (!['bullish', 'bearish', 'neutral'].includes(result.sentiment)) {
      result.sentiment = 'neutral';
    }
    if (typeof result.score !== 'number' || result.score < 0 || result.score > 100) {
      result.score = 50;
    }
    if (!result.summary) {
      result.summary = 'Sentiment analysis completed.';
    }

    return result;
  } catch (err) {
    console.error('analyzeNewsSentiment error:', err);
    return null;
  }
}
