'use client'
import { useState, useRef } from 'react'
import type { MarketPulse } from '@/types'
interface Props { tickers:string[]; pulse:MarketPulse }
export default function IntelligenceLab({tickers,pulse}:Props) {
  const [ticker,setTicker] = useState(tickers[0] || '')
  const [streaming,setStreaming] = useState(false)
  const [content,setContent] = useState('')
  const abortRef = useRef<AbortController|null>(null)
  async function summon() {
    if(streaming){abortRef.current?.abort();setStreaming(false);return}
    setContent('');setStreaming(true)
    abortRef.current = new AbortController()
    try{
      const res=await fetch('/api/intelligence',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ticker,.ix:pulse.indiaVix,regime:pulse.regime,fiiNet:pulse.fiiNetCr,mode:'debate'}),signal:abortRef.current.signal})
      const reader=res.body!.getReader(),dec=new TextDecoder()
      while(true){const{done,value}=await reader.read();if(done)break
        for(const l of dec.decode(value).split('\n').filter(l=>l.startsWith('data: '))){
          const p=l.slice(6);if(p === '[DONE]')break
          try{const {text}=JSON.parse(p);setContent(prev=>prev+text)}catch(){}
        }
      }
    }catch(e:unknown){if(e instanceof Error && e.name!=='AbortError')setContent(prev=>prev+'\n\n⚠️ Error')}finally{setStreaming(false)}
  }
  return(<div className="flex flex-col h-full"><div className="px-4 py-3 border-b border-[rgba(0,200,130,0.18)]"><h2 className="text-[11px] font-bold text-[#e2e8f0] tracking-wider">🧠 INTELLIGENCE LAB -- INVESTMENT COUNCIL</h2><p className="text-[9px] text-[#475569] mt-0.5">4-agent AI debate: BULL vs BEAR vs QUANT vs RISK MANAGER -- VIX {pulse.indiaVix} -- {pulse.regime}</p></div><div className="px-4 py-3 border-b border-[rgba(0,200,130,0.1)] flex items-end gap-3"><div><label className="text-[9px] text-[#475569] block mb-1">SELECT ASSET FOR DEBATE</label><select value={ticker} onChange={e=>{setTicker(e.target.value);setContent('')}} className="bg-[#141d2e] border border-[rgba(0,200,130,0.18)] text-[#e2e8f0] font-mono text-[10px] px-2 py-1.5 rounded w-64">{tickers.map(t=><option key={t} value={t}>{t.replace('.NS','')}</option>)}</select></div><button onClick={summon} className={`px-4 py-2 font-mono font-bold text-[10px] tracking-wider rounded border ${streaming?'bg-[rgba(239,68,68,0.15)] border-[rgba(239,68,68,0.3)] text-[#ef4444]':'bg-[rgba(0,200,130,0.15)] border-[rgba(0,200,130,0.3)] text-[#00c882] &}`}>{streaming?'⏹ STOP':'▖️ SUMMON COUNCIL'}</button></div><div className="flex-1 overflow-auto px-4 py-4">{(content||streaming)?(<div><pre className="text-[9px] text-[#94a3b8] whitespace-pre-wrap leading-relaxed">{content}{streaming&&<span className="animate-pulse">_</span>}</pre></div>):(<div className="flex items-center justify-center h-48"><p className="text-[#475569] text-xs">Select a stock and summon the council</p></div>)}</div></div>)
}
