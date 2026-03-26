'use client'
import { useState, useRef } from 'react'
import type { MarketPulse } from '@/types'

interface Props {
  tickers: string[]
  pulse: MarketPulse
}

export default function FilingAudit({ tickers, pulse }: Props) {
  const [ticker, setTicker] = useState(tickers[0] ?? '')
  const [streaming, setStreaming] = useState(false)
  const [content, setContent] = useState('')
  const [done, setDone] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  async function runAudit() {
    if (streaming) { abortRef.current?.abort(); setStreaming(false); return }
    setContent(''); setDone(false); setStreaming(true)
    abortRef.current = new AbortController()
    try {
      const res = await fetch('/api/intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker, vix: pulse.indiaVix, regime: pulse.regime, mode: 'filing' }),
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
      if (e instanceof Error && e.name !== 'AbortError') setContent(prev => prev + '\nError')
    } finally { setStreaming(false) }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-[rgba(0,200,130,0.18)]">
        <h2 className="text-[11px] font-bold text-[#e2e8f0]">FILING AUDIT - SEBI REG 30</h2>
      </div>
      <div className="px-4 py-3 border-b flex items-end gap-3">
        <select value={ticker} onChange={e => { setTicker(e.target.value); setContent(''); setDone(false) }}
          className="bg-[#141d2e] border border-[rgba(0,200,130,0.18)] text-[#e2e8f0] font-mono text-[10px] px-2 py-1.5 rounded w-64">
          {tickers.map(t => <option key={t} value={t}>{t.replace('.NS', '')}</option>)}
        </select>
        <button onClick={runAudit}
          className={`px-4 py-2 font-mono font-bold text-[10px] rounded border transition-all ${
            streaming ? 'text-[#ef4444] border-[rgba(239,68,68,0.3)]' : 'text-[#00a8ff] border-[rgba(0,168,255,0.3)] hover:bg-[rgba(0,168,255,0.1)]'
          }`}>
          {streaming ? 'STOP' : 'RUN AUDIT'}
        </button>
      </div>
      <div className="flex-1 overflow-auto px-4 py-4">
        {!content && !streaming && <p className="text-[#475569] text-xs p-8">Select a stock and run the audit</p>}
        {(content || streaming) && (
          <pre className="text-[9px] text-[#94a3b8] whitespace-pre-wrap leading-relaxed font-mono">
            {content}{streaming && <span className="animate-pulse">_</span>}
          </pre>
        )}
        {done && <p className="text-[8px] text-[#334155] mt-4">Audit complete</p>}
      </div>
    </div>
  )
}