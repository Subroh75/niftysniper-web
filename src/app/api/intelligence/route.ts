import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
function buildDebate(ticker: string, vix: number, regime: string, fiiNet: number) {
  return `You are running a live investment committee debate for ${ticker} on ${new Date().toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}.
Market Context: India VIX: ${vix} (${vix>20?'ELEVATED':'NORMAL'}), Regime: ${regime}, FII Net: ₹${fiiNet.toLocaleString('en-IN')} Cr (${fiiNet<0?'NET SELLERS':'NET BUYERS'})
Format as:
## Round 1: Opening Statements
**🟢 BULL:** [2-3 sentences - bullish case specific to this stock and India macro]
**🔴 BEAR:** [2-3 sentences - key risks]
**🔵 QUANT:** [2-3 sentences - technical levels, ADX, volume]
**🟡 RISK MANAGER:** [2-3 sentences - position sizing, VaR, stop loss]
## Round 2: Rebuttals
**🟢 BULL:** [Challenge the bear's key risk]
**🔴 BEAR:** [Challenge the bull's thesis]
**🔵 QUANT:** [Statistical probability of upside vs downside]
**🟡 RISK MANAGER:** [Final risk-adjusted recommendation with specific entry/SL levels]
## ⚖️ Verdict
[2-3 sentence committee consensus with specific action]`
}
function buildFiling(ticker: string) {
  return `You are a SEBI compliance expert. Conduct a Regulation 30 filing audit for ${ticker} as of ${new Date().toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}.
## 📋 Company Overview
## 🧬 Expected Regulation 30 Disclosures (FY26)
## ⚠️ Risk Flags to Watch
## 🚀 Potential Catalysts in Next 30 Days
## 📊 Analyst Verdict`
}
export async function POST(req: NextRequest) {
  const { ticker, vix=22.81, regime='BEARISH', fiiNet=-5518, mode='debate' } = await req.json()
  if (!ticker) return Response.json({ error: 'ticker required' }, { status: 400 })
  const prompt = mode==='filing' ? buildFiling(ticker) : buildDebate(ticker, vix, regime, fiiNet)
  const system = mode==='filing'
    ? 'You are an expert SEBI compliance analyst with deep knowledge of Indian equity markets and NSE/BSE listing obligations.'
    : 'You are moderator of a high-stakes investment committee for an Indian institutional fund. Be specific, use real market data, reference India-specific factors.'
  const stream = await anthropic.messages.stream({ model:'claude-sonnet-4-20250514', max_tokens:1500, system, messages:[{role:'user',content:prompt}] })
  const enc = new TextEncoder()
  const readable = new ReadableStream({
    async start(ctrl) {
      for await (const chunk of stream) {
        if (chunk.type==='content_block_delta' && chunk.delta.type==='text_delta') {
          ctrl.enqueue(enc.encode(`data: ${JSON.stringify({text:chunk.delta.text})}\n\n`))
        }
      }
      ctrl.enqueue(enc.encode('data: [DONE]\n\n'))
      ctrl.close()
    }
  })
  return new Response(readable, { headers:{'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive'} })
}