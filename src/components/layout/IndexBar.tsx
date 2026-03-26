'use client'
import { useState, useEffect } from 'react'
interface I { name:string;value:number;change:number;changePct:number }
const FB: I[] = [{name:'NIFTY 50',value:24117.75,change:183.40,changePct:0.77},{name:'NIFTY BANK',value:51842.30,change:312.15,changePct:0.61},{name:'SENSEX',value:79486.02,change:507.89,changePct:0.64},{name:'NIFTY IT',value:36742.55,change:-218.40,changePct:-0.59},{name:'USD/INR',value:83.42,change:-0.08,changePct:-0.10},{name:'INDIA VIX',value:22.81,change:-0.46,changePct:-1.98}]
export default function IndexBar() {
  const [idx,setIdx] = useState<I[]>(FB)
  useEffect(()=>{async function load(){try{const res=await fetch('/api/pulse'),t=await res.json();setIdx([{name:'NIFTY 50',...t.nifty50},{name:'NIFTY BANK',...t.niftyBank},{name:'SENSEX',value:t.sensex.value,change:t.sensex.change,changePct:t.sensex.changePct},{name:'USD/INR',value:t.usdInr,change:0,changePct:0},{name:'INDIA VIX',value:t.indiaVix,change:0,changePct:0}])}catch(){}};load();const t=setInterval(load,60000);return ()=>clearInterval(t)},[])
  return(<div className="flex overflow-x-auto border-b border-[rgba(0,200,130,0.18)] bg-[#141d2e] shrink-0">{idx.map(i=>(<div key={i.name} className="flex-shrink-0 px-4 py-2 border-r border-[rgba(0,200,130,0.12)] cursor-pointer hover:bg-[rgba(0,200,130,0.04)] min-w-[130px]"><div className="text-[8px] text-[#475569] uppercase mb-0.5">{i.name}</div><div className="text-[13px] font-bold text-[#e2e8f0] font-mono">{i.value.toLocaleString('en-IN',{maximumFractionDigits: 2})}</div>{i.change!==0&&<div className={`text-[9px] font-mono ${i.change<0?'text-[#ef4444]':'text-[#00c882]'}`}>{i.change<0?'▼':'▲'} {Math.abs(i.change).toFixed(2)} ({Math.abs(i.changePct).toFixed(2)}%)</div>}</div>))}</div>)
}
