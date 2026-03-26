import { Redis } from '@upstash/redis'
import type { OHLCV } from './engines/core'
const redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL!, token: process.env.UPSTASH_REDIS_REST_TOKEN! })
export async function getNifty500Symbols(): Promise<{ symbols: string[]; sectors: Record<string,string> }> {
  const ck = 'nse:nifty500:symbols'
  const cached = await redis.get<{ symbols: string[]; sectors: Record<string,string> }>(ck)
  if (cached) return cached
  try {
    const res = await fetch('https://archives.nseindia.com/content/indices/ind_nifty500list.csv', { headers: { 'User-Agent': 'Mozilla/5.0' } })
    const text = await res.text()
    const rows = text.trim().split('\n').slice(1)
    const symbols: string[] = [], sectors: Record<string,string> = {}
    for (const row of rows) {
      const cols = row.split(',')
      if (cols[2]) { const sym = cols[2].trim()+'.NS'; symbols.push(sym); sectors[sym] = cols[1]?.trim() ?? 'Misc' }
    }
    await redis.setex(ck, 86400, JSON.stringify({ symbols, sectors }))
    return { symbols, sectors }
  } catch {
    const core = ['RELIANCE.NS','TCS.NS','HDFCBANK.NS','INFY.NS','ICICIBANK.NS','BHARTIARTL.NS','KOTAKBANK.NS','LT.NS','SBIN.NS','AXISBANK.NS','BAJFINANCE.NS','HINDUNILVR.NS','MARUTI.NS','TATAMOTORS.NS','WIPRO.NS','HCLTECH.NS','TITAN.NS','ONGC.NS','ADANIENT.NS','NTPC.NS','POWERGRID.NS','SUNPHARMA.NS','DRREDDY.NS','CIPLA.NS','DIVISLAB.NS','BAJAJ-AUTO.NS','M&M.NS','TATASTEEL.NS','JSWSTEEL.NS','HINDALCO.NS']
    return { symbols: core, sectors: Object.fromEntries(core.map(s => [s,'Core Market'])) }
  }
}
export async function fetchCandles(ticker: string, period = '2y'): Promise<OHLCV[]> {
  const ck = `yf:candles:${ticker}:${period}`
  const cached = await redis.get<OHLCV[]>(ck)
  if (cached) return cached
  try {
    const ps: Record<string,number> = {'1mo':2592000,'3mo':7776000,'6mo':15552000,'1y':31536000,'2y':63072000}
    const now = Math.floor(Date.now()/1000), from = now - (ps[period]??ps['2y'])
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?period1=${from}&period2=${now}&interval=1d&includePrePost=false`
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 3600 } })
    if (!res.ok) return []
    const json = await res.json()
    const result = json?.chart?.result?.[0]
    if (!result) return []
    const ts: number[] = result.timestamp??[], q = result.indicators?.quote?.[0]??{}
    const candles: OHLCV[] = ts.map((t,i) => ({ time:t*1000, open:q.open?.[i]??0, high:q.high?.[i]??0, low:q.low?.[i]??0, close:q.close?.[i]??0, volume:q.volume?.[i]??0 })).filter(c => c.close>0)
    if (candles.length>0) await redis.setex(ck, 3600, JSON.stringify(candles))
    return candles
  } catch { return [] }
}
export async function fetchMarketPulse() {
  const ck = 'nse:pulse'
  const cached = await redis.get(ck)
  if (cached) return cached as Record<string,number>
  const indices = ['^NSEI','^BSESN','^NSEBANK','^INDIAVIX','USDINR=X']
  const results: Record<string,number> = {}
  await Promise.allSettled(indices.map(async idx => {
    try {
      const now = Math.floor(Date.now()/1000), from = now-7*86400
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(idx)}?period1=${from}&period2=${now}&interval=1d`
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
      const json = await res.json()
      const closes = json?.chart?.result?.[0]?.indicators?.quote?.[0]?.close??[]
      results[idx] = closes.filter(Boolean).at(-1)??0
      results[`${idx}_prev`] = closes.filter(Boolean).at(-2)??0
    } catch {}
  }))
  await redis.setex(ck, 60, JSON.stringify(results))
  return results
}