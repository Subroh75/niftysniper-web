'use client'
const H = ['RBI keeps repo rate 6.50% -- 5th hold','FII net sellers 5518 Cr -- equities offloaded','India Manufacturing PMI 58.4 -- 15-year high','Bharti Airtel 5G crosses 80 million','SEBI tightens F&O position limits April 2026','India forex reserves cross 680 Bn','Nifty 50 P/E at 21.8x -- fair value','INDIA VIX 22.81 -- elevated fear']
export default function NewsTicker() {
  return(<div className="flex items-center bg-[#0f1520] border-t border-[rgba(0,200,130,0.18)] overflow-hidden h-7 shrink-0"><div className="bg-[#ef4444] text-white text-[8px] font-bold px-2 h-full flex items-center flex-shrink-0">NSE LIVE</div><div className="flex-1 overflow-hidden flex items-center"><div className="flex animate-scroll whitespace-nowrap text-[9px] text-[#475569] font-mono">{
    [...H,...H].map((h,i)=><span key={i} className="mx-6">{h}． <span className="text-[#1e293b] mx-4">•••</span></span>)
  }</div></div></div>)
}
