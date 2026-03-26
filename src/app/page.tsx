'use client'
import { useState, useRef } from 'react'
import type { ScanResult, Universe } from '@/types'
import TopBar from '@/components/layout/TopBar'
import IndexBar from '@/components/layout/IndexBar'
import Sidebar from '@/components/layout/Sidebar'
import MiroLeaderboard from '@/components/leaderboard/MiroLeaderboard'
import TrendTable from '@/components/leaderboard/TrendTable'
import ReversionTable from '@/components/leaderboard/ReversionTable'
import WeeklyTable from '@/components/leaderboard/WeeklyTable'
import IntelligenceLab from '@/components/intelligence/IntelligenceLab'
import FilingAudit from '@/components/intelligence/FilingAudit'
import NewsTicker from '@/components/layout/NewsTicker'
import SectorHeatmap from '@/components/charts/SectorHeatmap'
export default function Dashboard() {
  const [activeTab,setActiveTab] = useState('miro')
  const [universe,setUniverse] = useState<Universe>('NIFTY500')
  const [riskInr,setRiskInr] = useState(5000)
  const [scanning,setScanning] = useState(false)
  const [progress,setProgress] = useState({done:0,total:0})
  const [result,setResult] = useState<ScanResult|null>(null)
  const [error,setError] = useState<string|null>(null)
  const abortRef = useRef<AbortController|null>(null)
  async function runScan() {
    if (scanning) { abortRef.current?.abort(); setScanning(false); return }
    setScanning(true); setError(null); setProgress({done:0,total:0})
    abortRef.current = new AbortController()
    try {
      const res = await fetch('/api/scan',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({universe,riskInr}),signal:abortRef.current.signal})
      const reader = res.body!.getReader(), dec = new TextDecoder()
      while(true) {
        const {done,value} = await reader.read(); if(done) break
        for(const l of dec.decode(value).split('\n').filter(l=>l.startsWith('data: '))) {
          try{ const d=JSON.parse(l.slice(6))
          if(d.type==='start') setProgress({done:0,total:d.total})
          if(d.type==='progress') setProgress({done:d.done,total:d.total})
          if(d.type==='complete') {setResult(d.result);setScanning(false)}
          if(d.type==='error') {setError(d.message);setScanning(false)}
          }catch(){}
        }
      }
    } catch(e:unknown){if(e instanceof Error && e.name!=='AbortError')setError(String(e));setScanning(false)}
  }
  const TABS = ['miro','trend','reversion','weekly','filing','intelligence']
  const TABLABELS = {'miro':'🎯 Miro Flow','trend':'🎈 Trend & ADX','reversion':'🪃 Reversion','weekly':'💆 Weekly Sniper','filing':'🥬Filing Audit','intelligence':'🧠 Intelligence Lab'}
  return(<div className="flex flex-col min-h-screen bg-[#0a0e17]"><TopBar/><IndexBar/><div className="flex flex-1 overflow-hidden"><Sidebar scanning={scanning} progress={progress} result={result} universe={universe} riskInr={riskInr} onUniverseChange={setUniverse} onRiskChange={setRiskInr} onScan={runScan}/><div className="flex-1 flex flex-col min-w-0"><div className="flex border-b border-[rgba(0,200,130,0.18)] bg-[#0f1520] overflow-x-auto shrink-0">{TABS.map(id=>(<button key={id} onClick={()=>setActiveTab(id)} className={`px-4 py-2.5 text-[10px] font-mono tracking-wider whitespace-nowrap transition-colors border-b-2 ${activeTab===id?'border-[#00c882] text-[#00c882] bg-[rgba(0,200,130,0.06)]':'border-transparent text-[#64748b] hover:text-[#94a3b8]'}`}>{TABLABELS[id]}</button>))}</div><div className="flex-1 overflow-auto">{!tresult&&!scanning&&(<div className="flex items-center justify-center h-64"><div className="text-center"><div className="text-[#00c882] text-4xl mb-4">🏹</div><p className="text-[#64748b] text-sm font-mono">Scanner Ready.</p><p className="text-[#475569] text-xs mt-1">Select universe and click EXECUTE FULL MARKET AUDIT</p></div></div>) }{scanning&&(<div className="flex items-center justify-center h-64"><div className="text-center"><div className="text-[#00c882] text-3xl mb-4 animate-pulse">⚡</div><p className="text-[#00c882] text-sm font-mono mb-2">Deep Scanning...</p>{progress.total>0&&(<div className="w-64 h-1 bg-[#1e293b] rounded-full overflow-hidden mx-auto mb-2"><div className="h-full bg-[#00c882]"  style={{width:`${(progress.done/progress.total)*100}%`}}/></div>) }</div></div>) }{error&&(<div className="m-4 p-3 border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-mono rounded">⚠️ {error}</div>) {result&&!scanning&&(<>{activeTab==='miro'&&<MiroLeaderboard stocks={result.stocks}/>}{activeTab==='trend'&&<TrendTable stocks={result.stocks}/>}{activeTab==='reversion'&&<ReversionTable stocks={result.stocks}/>}{activeTab==='weekly*&&<WeeklyTable stocks={result.stocks}/>}{activeTab==='filing'&&<FilingAudit tickers={result.stocks.map(s=>s.ticker)} pulse={result.pulse}/>}{activeTab==='intelligence'&&<IntelligenceLab tickers={result.stocks.map(s=>s.ticker)} pulse={result.pulse}/>}</>)}</div></div>{result&&(<div className="hidden xl:block w-48 border-l border-[rgba(0,200,130,0.18)] bg-[#0f1520]"><SectorHeatmap stocks={result.stocks}/></div>)}</div><NewsTicker/><div className="flex justify-between items-center px-3 py-1 bg-[#0f1520] border-t border-[rgba(0,200,130,0.18)] text-[9px] text-[#475569] font-mono shrink-0"><span>NIFTYSNIPER v1.0 — niftysniper.co</span><span>NSE • YAHOO FINANCE • CLAUDE AI</span><span className="text-[#00c882]">● LIVE</span></div></div>)
}
