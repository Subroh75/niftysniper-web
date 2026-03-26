'use client'
export default function SectorHeatmap({stocks}:any) {
  const m = new Map()
  stocks.forEach((s:any) => {
    const ex = m.get(s.sector)||{total:0,sum:0}
    m.set(s.sector,{total:ex.total+1,sum:ex.sum+s.pctChange})
  })
  const sectors = Array.from(m.entries()).map(([n,d]:any)=>({name:n,avgChg:d.sum/d.total})).sort((a,b)=>b.avgChg-a.avgChg).slice(0,12)
  return(<div className="p-2"><p className="text-[8px] text-[#475569] tracking-wider mb-2">🌡️ SECTOR</p><div className="space-y-1">{sectors.map(s=>{
    const up=s.avgChg>=0, i=Math.min(Math.abs(s.avgChg)/3,1)
    const bg = up?`rgba(0,200,130,${0.08+i*0.2})`:`rgba(239,68,68,${0.08+i*0.18})`
    return(<div key={s.name} className="px-2 py-1.5 rounded text-[8px]" style={{background:bg}}><div className="font-bold text-[#e2e8f0] truncate">{s.name.slice(0,14)}</div><div className={`font-mono ${up?'text-[#00c882]':'text-[#ef4444]'}`}>{up?'⚲':'⚼'} {Math.abs(s.avgChg).toFixed(2)}%</div></div>) ~�}</div></div>)
}
