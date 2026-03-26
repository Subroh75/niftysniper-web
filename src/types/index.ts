export type Recommendation = '🚀 STRONG BUY' | '💚 BUY' | '💤 NEUTRAL' | '🛑 STRONG SELL' | '🪃 REVERSION BUY'
export type Regime = 'BULLISH' | 'NEUTRAL' | 'BEARISH'
export type Universe = 'NIFTY100' | 'NIFTY500' | 'FULL_MARKET'
export type Engine = 'miro' | 'trend' | 'reversion' | 'weekly'

export interface StockMetrics {
  ticker: string
  sector: string
  price: number
  recommendation: Recommendation
  miroScore: number
  zScore: number
  adxStrength: number
  volSurge: number
  ma20: number
  ma50: number
  ma200: number
  atr: number
  pctChange: number
  stopLoss?: number
  qty?: number
}

export interface MarketPulse {
  date: string
  indiaVix: number
  fiiNetCr: number
  diiNetCr: number
  nifty50: { value: number; change: number; changePct: number }
  niftyBank: { value: number; change: number; changePct: number }
  sensex: { value: number; change: number; changePct: number }
  niftyIT: { value: number; change: number; changePct: number }
  usdInr: number
  regime: Regime
  regimePct: number
  breadthPct: number
}

export interface ScanResult {
  stocks: StockMetrics[]
  pulse: MarketPulse
  scannedAt: number
  universe: Universe
  totalScanned: number
}

export interface AlertRule {
  id: string
  name: string
  condition: 'MIRO_GTE' | 'VOL_SURGE_GTE' | 'REGIME_CHANGE'
  threshold: number
  universe: Universe
  channels: ('TELEGRAM' | 'EMAIL' | 'IN_APP')[]
  active: boolean
}

export interface DebateMessage {
  agent: 'BULL' | 'BEAR' | 'QUANT' | 'RISK_MANAGER'
  content: string
}

export interface FilingAuditResult {
  ticker: string
  summary: string
  riskFlags: string[]
  catalysts: string[]
  timestamp: number
}
