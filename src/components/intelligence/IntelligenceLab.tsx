'use client'
import { useState, useRef } from 'react'
import type { MarketPulse } from '@/types'

interface Props {
  tickers: string[]
  pulse: MarketPulse
}

export default function IntelligenceLab({ tickers, pulse }: Props) {
  const [ticker, setTicker] = useState(tickers[0] ?? '')
  const [streaming, setStreaming] = useState(false)
  const [content, setContent] = useState('')
  const [done, setDone] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  async function summon() {
    if (streaming) { abortRef.current?.abort(); setStreaming(false); return }
    setContent(''); setDone(false); setStreaming(true)
    abortRef.current = new AbortController()
    try {
      const res = await fetch('/api/intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker, vix: pulse.indiaVix, regime: pulse.regime, fiiNet: pulse.fiiNetCr, mode: 'debate' }),
        signal: abortRef.current.signal,
      })
      const reader = res.body!.getReader()
      const dec = new TextDecoder()
      while (true) {
        const { done: d, value } = await reader.read()
        if (d) break
        for (const line of dec.decode(value).split('\n').filter(l => l.startsWith('data: '))) {
          const payload = line.slice(6)
          if (payload === '[DONE]') { setDone(true); break }
          try { const { text } = JSON.parse(payload); setContent(prev => prev + text) } catch (_e) { /* skip */ }
        }
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== 'AbortError') setContent(prev => prev + '\n\nConnection error.')
    } finally { setStreaming(false) }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-[rgba(0,200,130,0.18)]">
        <h2 className="text-[11px] font-bold text-[#e2e8f0] tracking-wider">INTELLIGENCE LAB - INVESTMENT COUNCIL</h2>
        <p className="text-[9px] text-[#475569] mt-0.5">4-agent AI debate: BULL vs BEAR vs QUANT vs RISK MANAGER - VIX {pulse.indiaVix} - {pulse.regime}</p>
      </div>
      <div className="px-4 py-3 border-b border-[rgba(0,200,130,0.1)] flex items-end gap-3">
        <div className="flex-1">
          <label className="text-[9px] text-[#475569] block mb-1">SELECT ASSET FOR DEBATE</label>
          <select value={ticker} onChange={e => { setTicker(e.target.value); setContent(''); setDone(false) }}
            className="bg-[#141d2e] border border-[rgba(0,200,130,0.18)] text-[#e2e8f0] font-mono text-[10px] px-2 py-1.5 rounded focus:outline-none w-full max-w-xs">
            {tickers.map(t => <option key={t} value={t}>{t.replace('.NS', '')}</option>)}
          </select>
        </div>
        <button onClick={summon}
          className={`px-4 py-2 font-mono font-bold text-[10px] tracking-wider rounded border transition-all ${
            streaming
              ? 'bg-[rgba(239,68,68,0.15)] border-[rgba(239,68,68,0.3)] text-[#ef4444]'
              : 'bg-[rgba(0,200,130,0.15)] border-[rgba(0,200,130,0.3)] text-[#00c882] hover:bg-[rgba(0,200,130,0.25)]'
          }`}>
          {streaming ? 'STOP' : 'SUMMON COUNCIL'}
        </button>
      </div>
      <div className="flex-1 overflow-auto px-4 py-4">
        {!content && !streaming && (
          <div className="flex items-center justify-center h-48">
            <p className="text-[#475569] text-xs">Select a stock and summon the council</p>
          </div>
        )}
        {(content || streaming) && (
          <pre className="text-[9px] text-[#94a3b8] whitespace-pre-wrap leading-relaxed font-mono">
            {content}{streaming && <span className="animate-pulse">_</span>}
          </pre>
        )}
        {done && <p className="text-[8px] text-[#334155] mt-4 pt-2 border-t border-[rgba(0,200,130,0.1)]">Council debate complete</p>}
      </div>
    </div>
  )
}