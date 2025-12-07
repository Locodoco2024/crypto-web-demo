import type { Time } from "lightweight-charts"

// ============ TypeScript Types ============
export interface CandlestickDataPoint {
  time: Time
  open: number
  high: number
  low: number
  close: number
}

export interface VolumeDataPoint {
  time: Time
  value: number
  color?: string
}

export type TimeFrame = "15m" | "1h" | "4h" | "1d"

export type ColorScheme = "greenRed" | "redGreen"

// ============ Time Frame Labels ============
export const TIME_FRAME_LABELS: Record<TimeFrame, string> = {
  "15m": "15 分鐘",
  "1h": "1 小時",
  "4h": "4 小時",
  "1d": "1 天",
}

// ============ Constants ============
export const FIXED_BASE_DATE = new Date("2026-01-01T00:00:00Z").getTime()

export const TIME_INTERVALS: Record<TimeFrame, number> = {
  "15m": 15 * 60 * 1000,
  "1h": 60 * 60 * 1000,
  "4h": 4 * 60 * 60 * 1000,
  "1d": 24 * 60 * 60 * 1000,
}

export const seededRandom = (seed: number): number => {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

export const generateHistoricalData = (
  timeFrame: TimeFrame,
  beforeTimestamp: number, // 在此時間戳之前生成資料
  count: number,
  seedOffset: number, // 種子偏移以確保不同批次資料不同
): { candlestick: CandlestickDataPoint[]; volume: VolumeDataPoint[] } => {
  const candlestick: CandlestickDataPoint[] = []
  const volume: VolumeDataPoint[] = []

  const interval = TIME_INTERVALS[timeFrame]

  // 從現有最早資料往回推算價格
  let seed = timeFrame.charCodeAt(0) * 1000 + seedOffset
  let currentPrice = 100000 * (0.9 + seededRandom(seed) * 0.2) // 隨機基礎價格

  for (let i = count; i > 0; i--) {
    const timestamp = new Date(beforeTimestamp - i * interval)

    let timeValue: Time
    if (timeFrame === "1d") {
      timeValue = timestamp.toISOString().split("T")[0] as Time
    } else {
      timeValue = Math.floor(timestamp.getTime() / 1000) as Time
    }

    const volatility = timeFrame === "15m" ? 0.005 : timeFrame === "1h" ? 0.01 : timeFrame === "4h" ? 0.02 : 0.03
    seed++
    const change = (seededRandom(seed) - 0.5) * 2 * volatility
    const open = currentPrice
    const close = open * (1 + change)
    seed++
    const high = Math.max(open, close) * (1 + seededRandom(seed) * volatility * 0.5)
    seed++
    const low = Math.min(open, close) * (1 - seededRandom(seed) * volatility * 0.5)

    candlestick.push({
      time: timeValue,
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
    })

    seed++
    volume.push({
      time: timeValue,
      value: Math.floor(seededRandom(seed) * 50000) + 10000,
    })

    currentPrice = close
  }

  return { candlestick, volume }
}

const generateMockData = (
  timeFrame: TimeFrame,
  basePrice = 100000,
  count = 60,
): { candlestick: CandlestickDataPoint[]; volume: VolumeDataPoint[] } => {
  const candlestick: CandlestickDataPoint[] = []
  const volume: VolumeDataPoint[] = []

  const interval = TIME_INTERVALS[timeFrame]
  const startTime = FIXED_BASE_DATE

  let currentPrice = basePrice
  let seed = timeFrame.charCodeAt(0) * 1000

  for (let i = 0; i < count; i++) {
    const timestamp = new Date(startTime + i * interval)

    let timeValue: Time
    if (timeFrame === "1d") {
      timeValue = timestamp.toISOString().split("T")[0] as Time
    } else {
      timeValue = Math.floor(timestamp.getTime() / 1000) as Time
    }

    const volatility = timeFrame === "15m" ? 0.005 : timeFrame === "1h" ? 0.01 : timeFrame === "4h" ? 0.02 : 0.03
    seed++
    const change = (seededRandom(seed) - 0.5) * 2 * volatility
    const open = currentPrice
    const close = open * (1 + change)
    seed++
    const high = Math.max(open, close) * (1 + seededRandom(seed) * volatility * 0.5)
    seed++
    const low = Math.min(open, close) * (1 - seededRandom(seed) * volatility * 0.5)

    candlestick.push({
      time: timeValue,
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
    })

    seed++
    volume.push({
      time: timeValue,
      value: Math.floor(seededRandom(seed) * 50000) + 10000,
    })

    currentPrice = close
  }

  return { candlestick, volume }
}

const data1d = generateMockData("1d", 100000, 30)
const data4h = generateMockData("4h", 100000, 60)
const data1h = generateMockData("1h", 100000, 72)
const data15m = generateMockData("15m", 100000, 96)

export const MOCK_DATA_BY_TIMEFRAME: Record<
  TimeFrame,
  { candlestick: CandlestickDataPoint[]; volume: VolumeDataPoint[] }
> = {
  "1d": data1d,
  "4h": data4h,
  "1h": data1h,
  "15m": data15m,
}

export const MOCK_CANDLESTICK_DATA = data1d.candlestick
export const MOCK_VOLUME_DATA = data1d.volume
