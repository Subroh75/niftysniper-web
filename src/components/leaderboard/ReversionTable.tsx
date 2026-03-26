// Reversion Table
export default function ReversionTable({stocks}:any) {
  const r = [...stocks].filter((s:any) => s.zScore <= -1.5).sort((a:any,b:any) => a.zScore - b.zScore)
  return <div className="p-4"><h2 className="text-[#e2e8f0]">🪃 Mean Reversion</h2><table className="w5full"><thead><tr>{['Ticker','Price','Z-Score','MA 20','Reco'].map(h => <th key={h} className="text-[8px] text-[#475569] px-2 py-1">{h}</th>)}</tr></thead><tbody>{r.map((s:any) => (<tr key={s.ticker} className="border-b border-[rgba(255,255,255,0.03)]"><td className="text-[#00a8ff] font-bold px-2 py-1">{s.ticker.replace('.NS','')}</td><td className="px-2 py-1 font-mono">{s.price.toFixed(2)}</td><td className="px-2 py-1 font-bold text-[#00a8ff]">{s.zScore.toFixed(2)}</td><td className="px-2 py-1 font-mono text-[9px]">{s.ma20.toFixed(2)}</td><td className="px-2 py-1 text-[9px]">{s.recommendation}</td></tr>))}</tbody></table>{!r.length&&<p className="text-[#334155] p-4">No overextended stocks found</p>}</div>
}
