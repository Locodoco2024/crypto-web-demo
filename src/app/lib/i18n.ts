// ============ i18n 多語系 ============

export type Locale = "zh-TW" | "en"

export const translations = {
  "zh-TW": {
    // Nav
    appName: "CryptoChart",
    notifications: "通知",

    // Price Chart
    time: "時間",
    open: "開盤",
    close: "收盤",
    high: "最高",
    low: "最低",
    change: "漲跌幅",
    volume: "成交量",

    // Time Frames
    "15m": "15 分鐘",
    "1h": "1 小時",
    "4h": "4 小時",
    "1d": "1 天",

    // Date format labels
    jan: "1月",
    feb: "2月",
    mar: "3月",
    apr: "4月",
    may: "5月",
    jun: "6月",
    jul: "7月",
    aug: "8月",
    sep: "9月",
    oct: "10月",
    nov: "11月",
    dec: "12月",
  },
  en: {
    // Nav
    appName: "CryptoChart",
    notifications: "Notifications",

    // Price Chart
    time: "Time",
    open: "Open",
    close: "Close",
    high: "High",
    low: "Low",
    change: "Change",
    volume: "Volume",

    // Time Frames
    "15m": "15m",
    "1h": "1H",
    "4h": "4H",
    "1d": "1D",

    // Date format labels
    jan: "Jan",
    feb: "Feb",
    mar: "Mar",
    apr: "Apr",
    may: "May",
    jun: "Jun",
    jul: "Jul",
    aug: "Aug",
    sep: "Sep",
    oct: "Oct",
    nov: "Nov",
    dec: "Dec",
  },
} as const

export type TranslationKey = keyof (typeof translations)["zh-TW"]

export const getTranslation = (locale: Locale, key: TranslationKey): string => {
  return translations[locale][key]
}

export const LOCALE_LABELS: Record<Locale, string> = {
  "zh-TW": "繁中",
  en: "EN",
}
