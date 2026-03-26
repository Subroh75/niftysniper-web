import { fetchMarketPulse } from '@/lib/data'
import { NextRequest } from 'next/server'
export async function GET(_req: NextRequest) {
  try {
    const raw = await fetchMarketPulse()
    const vix = raw['^INDIAVIX']??22.81, nifty = raw['^NSEI']??24117, niftyP = raw['^NSEI_prev']??nifty
    const bank = raw['^NSEBANK']??51842, bankP = raw['^NSEBANK_prev']??bank
    return Response.json({ indiaVix: Math.round(vix*100)/100, fiiNetCr: -5518.39,
      nifty50: { value: Math.round(nifty*100)/100, change: Math.round((nifty-niftyP)*100)/100, changePct: niftyP ? Math.round(((nifty-niftyP)/niftyP)*10000)/100 : 0 },
      niftyBank: { value: Math.round(bank*100)/100, change: Math.round((bank-bankP)*100)/100, changePct: bankP ? Math.round(((bank-bankP)/bankP)*10000)/100 : 0 },
      sensex: { value: Math.round((raw['^BSESN']??79486)*100)/100, change: 0, changePct: 0 },
      usdInr: Math.round((raw['USDINR=X']??83.42)*100)/100, timestamp: Date.now() })
  } catch(e) { return Response.json({ error: String(e) }, { status: 500 }) }
}