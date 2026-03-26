'use client'
import type { ScanResult, Universe } from '@/types'

interface Props {
  scanning: boolean
  progress: { done: number; total: number }
  result: ScanResult | null
  universe: Universe
  riskInr: number
  onUniverseChange: (u: Universe) => void
  onRiskChange: (v: number) => void
  onScan: () => void
}

const UNIVERSES: { value: Universe; label: string; sub: string }[] = [
  { value: 'NIFTY100', label: 'Nifty 100', sub: '~2 min' },
  { value: 'NIFTY500', label: 'Nifty 500', sub: '~8 min' },
  { value: 'FULL_MARKET', label: 'Full Market', sub: '~20 min' },
]

export default function Sidebar({ scanning, progress, result, universe, riskInr, onUniverseChange, onRiskChange, onScan }: Props) {
  const pulse = result?.pulse
  const regime = pulse?.regime ?? null

  const regimeColor = regime === 'BULLISH' ? '#00c882' : regime === 'BEARISH' ? '#ef4444' : '#f59e0b'
  const regimeBg = regime === 'BULLISH' ? 'rgba(0,200,130,0.12)' : regime === 'BEARISH' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)'
  const regimeLabel = regime ? `${regime} (${pulse?.breadthPct}%)` : '--'

  return (
    <div className="w-56 flex-shrink-0 border-r border-[rgba(0,200,130,0.18)] bg-[#0f1520] flex flex-col overflow-y-auto">
      <div className="p-3 space-y-3">
        <div>
          <p className="text-[10px] text-[#64748b] tracking-wider">NIFTY SNIPER v1.0</p>
          <p className="text-[9px] text-[#334155] mt-0.5">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} Pulse</p>
        </div>

        <div className="border border-[rgba(0,200,130,0.18)] rounded">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="border-b border-[rgba(0,200,130,0.12)]">
                <th className="text-left p-1.5 text-[#475569] font-normal">Metric</th>
                <th className="text-right p-1.5 text-[#475569] font-normal">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-1.5 text-[#94a3b8]">India VIX</td>
                <td className={`p-1.5 text-right font-bold ${(pulse?.indiaVix ?? 22.81) > 20 ? 'text-[#ef4444]' : 'text-[#f59e0b]'}`}>
                  {(pulse?.indiaVix ?? 22.81).toFixed(2)}
                </td>
              </tr>
              <tr>
                <td className="p-1.5 text-[#94a3b8]">FII Net (Cr)</td>
                <td className={`p-1.5 text-right font-bold ${(pulse?.fiiNetCr ?? -5518) < 0 ? 'text-[#ef4444]' : 'text-[#00c882]'}`}>
                  {(pulse?.fiiNetCr ?? -5518.39).toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <p className="text-[9px] text-[#475569] tracking-wider mb-1.5">SCAN UNIVERSE</p>
          <div className="space-y-1">
            {UNIVERSES.map(u => (
              <button key={u.value} onClick={() => onUniverseChange(u.value)}
                className={`w-full flex justify-between items-center px-2 py-1.5 rounded text-[10px] font-mono transition-colors ${
                  universe === u.value
                    ? 'bg-[rgba(0,200,130,0.15)] border border-[rgba(0,200,130,0.3)] text-[#00c882]'
                    : 'border border-[rgba(255,255,255,0.06)] text-[#64748b] hover:border-[rgba(0,200,130,0.2)]'
                }`}>
                <span>{u.label}</span>
                <span className="text-[8px] opacity-60">{u.sub}</span>
              </button>
            ))}
          </div>
        </div>

        <button onClick={onScan}
          className={`w-full py-2.5 font-mono font-bold text-[11px] tracking-wider rounded border transition-all ${
            scanning
              ? 'bg-[rgba(239,68,68,0.15)] border-[rgba(239,68,68,0.3)] text-[#ef4444] animate-pulse'
              : 'bg-[rgba(0,200,130,0.15)] border-[rgba(0,200,130,0.3)] text-[#00c882] hover:bg-[rgba(0,200,130,0.25)]'
          }`}>
          {scanning ? `STOP (${progress.done}/${progress.total})` : 'EXECUTE FULL MARKET AUDIT'}
        </button>

        {pulse && (
          <div>
            <p className="text-[9px] text-[#475569] tracking-wider mb-1.5">MARKET HEATMAP</p>
            <div className="p-2 rounded text-[10px] font-bold text-center"
              style={{ background: regimeBg, border: `1px solid ${regimeColor}50`, color: regimeColor }}>
              {regimeLabel}
            </div>
          </div>
        )}

        <div>
          <p className="text-[9px] text-[#475569] tracking-wider mb-1.5">RISK CAPITAL (Rs)</p>
          <input type="number" value={riskInr}
            onChange={e => onRiskChange(Number(e.target.value))}
            className="w-full bg-[#141d2e] border border-[rgba(0,200,130,0.18)] text-[#e2e8f0] font-mono text-[11px] px-2 py-1.5 rounded focus:outline-none focus:border-[#00c882]"
          />
          <p className="text-[8px] text-[#334155] mt-1">VIX {(pulse?.indiaVix ?? 22.81) > 20 ? '>20 => 3x ATR SL' : '<=20 => 2x ATR SL'}</p>
        </div>

        {result && (
          <div className="text-[8px] text-[#334155] space-y-0.5">
            <p>{result.totalScanned} stocks scanned</p>
            <p>{result.stocks.filter(s => s.recommendation.includes('STRONG BUY')).length} Strong Buys</p>
            <p>{result.stocks.filter(s => s.recommendation.includes('REVERSION')).length} Reversion Buys</p>
          </div>
        )}
      </div>
    </div>
  )
}