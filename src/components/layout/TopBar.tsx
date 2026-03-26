'use client'
import { useState, useEffect } from 'react'
export default function TopBar() {
  const [time,setTime] = useState('')
  useEffect(()=>{
    const u=()=>setTime(new Date().toLocaleTimeString('en-IN',{timeZone:'Asia/Kolkata',hour12:false}))
    u();const t=setInterval(u,1000);return ()=>clearInterval(t)
  },[])
  return(<div className="flex items-center justify-between px-3 py-1.5 bg-[#0f1520] border-b border-[rgba(0,200,130,0.18)] shrink-0"><div className="flex items-center gap-3"><span className="font-mono font-bold text-[13px] text-[#00c882] tracking-[2px]">NIFTY<span className="text-[#00a8ff]">SNIPER</span></span><span className="text-[9px] text-[#475569] tracking-wider">INSTITUTIONAL MARKET INTELLIGENCE</span></div><div className="flex items-center gap-4 text-[10px] text-[#64748b] font-mono"><span className="flex items-center gap-1"><span className="live-dot"/>NSE LIVE</span><span>IST s{time}</span><span className="text-[#00c882] font-bold">₹ INR</span></div></div>)
}
