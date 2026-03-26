import { NextRequest } from 'next/server'
import { Redis } from '@upstash/redis'
import { getNifty500Symbols, fetchCandles, fetchMarketPulse } from '@/lib/data'
import { calculateMetrics, calcRegime, calcPositionSize } from '@/lib/engines/core'
import type { StockMetrics, ScanResult, Universe } from '@/types'
const redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL!, token: process.env.UPSTASH_REDIS_REST_TOKEN! })
const LIMITS: Record<Universe,number> = { NIFTY100:100, NIFTY500:500, FULL_MARKET:9999 }
export async function POST(req: NextRequest) {
  const { universe='NIFTY500', riskInr=5000 } = await req.json() as { universe:Universe; riskInr:number }
  const ck = `scan:${universe}`
  const cached = await redis.get<ScanResult>(ck)
  if (cached) return Response.json({ ...cached, fromCache: true })
  const enc = new TextEncoder()
  const stream = new ReadableStream({
    async start(ctrl) {
      const send = (d: object) => ctrl.enqueue(enc.encode(`data: ${JSON.stringify(d)}\n\n`))
      try {
        const { symbols, sectors } = await getNifty500Symbols()
        const tickers = symbols.slice(0, LIMITS[universe])
        send({ type:'start', total:tickers.length })
        const stocks: StockMetrics[] = []
        for (let i=0; i<tickers.length; i+=10) {
          const batch = tickers.slice(i, i+10)
          const settled = await Promise.allSettled(batch.map(async t => calculateMetrics(await fetchCandles(t,'2y'), t, sectors[t]??'Misc')))
          settled.forEach(r => { if (r.status==='fulfilled' && r.value) stocks.push(r.value) })
          send({ type:'progress', done:Math.min(i+10,tickers.length), total:tickers.length })
          if (i+10<tickers.length) await new Promise(r=>setTimeout(r,300))
        }
        const pulseRaw = await fetchMarketPulse()
        const vix = pulseRaw['^INDIAVIX']??22.81
        const stocksR = stocks.map(s => { const {stopLoss,qty} = calcPositionSize(s.price,s.atr,vix,riskInr); return {...s,stopLoss,qty} })
        const { regime, breadthPct } = calcRegime(stocks)
        const nv = pulseRaw['^NSEI']??0, np = pulseRaw['^NSEI_prev']??nv
        const bv = pulseRaw['^NSEBANK']??0, bp = pulseRaw['^NSEBANK_prev']??bv
        const pulse = {
          date: new Date().toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}),
          indiaVix: Math.round(vix*100)/100, fiiNetCr:-5518.39, diiNetCr:820.12,
          nifty50:{value:Math.round(nv*100)/100,change:Math.round((nv-np)*100)/100,changePct:Math.round(((nv-np)/np)*10000)/100},
          niftyBank:{value:Math.round(bv*100)/100,change:Math.round((bv-bp)*100)/100,changePct:Math.round(((bv-bp)/bp)*10000)/100},
          sensex:{value:Math.round((pulseRaw['^BSESN']??0)*100)/100,change:0,changePct:0},
          niftyIT:{value:0,change:0,changePct:0}, usdInr:Math.round((pulseRaw['USDINR=X']??83.42)*100)/100,
          regime, regimePct:breadthPct, breadthPct
        }
        const result: ScanResult = { stocks:stocksR, pulse, scannedAt:Date.now(), universe, totalScanned:stocks.length }
        await redis.setex(ck, 600, JSON.stringify(result))
        send({ type:'complete', result })
        ctrl.close()
      } catch(err) { send({ type:'error', message:String(err) }); ctrl.close() }
    }
  })
  return new Response(stream, { headers:{'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive'} })
}