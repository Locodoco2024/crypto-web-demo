"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  type IChartApi,
  type CandlestickData,
  type Time,
  type ISeriesApi,
  type SeriesType,
} from "lightweight-charts";
import {
  MOCK_DATA_BY_TIMEFRAME,
  generateHistoricalData,
  type CandlestickDataPoint,
  type VolumeDataPoint,
  type TimeFrame,
  type ColorScheme,
} from "../data/mock-chart-data";
import { type Locale, getTranslation } from "../lib/i18n";

// ============ Props Interface ============
interface PriceChartProps {
  symbol?: string;
  dataByTimeFrame?: Record<
    TimeFrame,
    { candlestick: CandlestickDataPoint[]; volume: VolumeDataPoint[] }
  >;
  height?: number;
  colorScheme?: ColorScheme;
  defaultTimeFrame?: TimeFrame;
  onTimeFrameChange?: (timeFrame: TimeFrame) => void;
  locale?: Locale;
}

// ============ Color Config ============
const COLOR_SCHEMES: Record<
  ColorScheme,
  { up: string; down: string; upAlpha: string; downAlpha: string }
> = {
  greenRed: {
    up: "#26a69a",
    down: "#ef5350",
    upAlpha: "rgba(38, 166, 154, 0.5)",
    downAlpha: "rgba(239, 83, 80, 0.5)",
  },
  redGreen: {
    up: "#ef5350",
    down: "#26a69a",
    upAlpha: "rgba(239, 83, 80, 0.5)",
    downAlpha: "rgba(38, 166, 154, 0.5)",
  },
};

interface TooltipInfo {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  changePercent: number;
  isUp: boolean;
}

const getTimestamp = (time: Time): number => {
  if (typeof time === "string") {
    return new Date(time).getTime();
  } else if (typeof time === "number") {
    return time * 1000;
  }
  return 0;
};

const getTimeScaleLocalization = (locale: Locale) => {
  if (locale === "zh-TW") {
    return {
      locale: "zh-TW",
      dateFormat: "yyyy-MM-dd",
    };
  }
  return {
    locale: "en-US",
    dateFormat: "yyyy-MM-dd",
  };
};

// ============ Component ============
export default function PriceChart({
  symbol = "BTC/USDT",
  dataByTimeFrame = MOCK_DATA_BY_TIMEFRAME,
  height = 500,
  colorScheme = "greenRed",
  defaultTimeFrame = "1d",
  onTimeFrameChange,
  locale = "zh-TW",
}: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<SeriesType> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<SeriesType> | null>(null);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>(defaultTimeFrame);
  const [tooltipInfo, setTooltipInfo] = useState<TooltipInfo | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [containerWidth, setContainerWidth] = useState(400);

  const [dynamicData, setDynamicData] = useState<{
    candlestick: CandlestickDataPoint[];
    volume: VolumeDataPoint[];
  }>(() => dataByTimeFrame[defaultTimeFrame]);

  const loadCountRef = useRef(0);
  const isLoadingRef = useRef(false);

  const colors = COLOR_SCHEMES[colorScheme];

  const t = (key: Parameters<typeof getTranslation>[1]) =>
    getTranslation(locale, key);

  const formatTime = useCallback(
    (time: Time): string => {
      let date: Date;

      if (typeof time === "string") {
        date = new Date(time);
      } else if (typeof time === "number") {
        date = new Date(time * 1000);
      } else {
        return String(time);
      }

      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      const hh = String(date.getHours()).padStart(2, "0");
      const min = String(date.getMinutes()).padStart(2, "0");

      switch (timeFrame) {
        case "1d":
          return `${yyyy}-${mm}-${dd}`;
        case "4h":
        case "1h":
          return `${yyyy}-${mm}-${dd} ${hh}:00`;
        case "15m":
          return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
        default:
          return `${yyyy}-${mm}-${dd}`;
      }
    },
    [timeFrame]
  );

  const handleTimeFrameChange = useCallback(
    (newTimeFrame: TimeFrame) => {
      setTimeFrame(newTimeFrame);
      setDynamicData(dataByTimeFrame[newTimeFrame]);
      loadCountRef.current = 0;
      setTooltipInfo(null);
      onTimeFrameChange?.(newTimeFrame);
    },
    [dataByTimeFrame, onTimeFrameChange]
  );

  const sortedData = useMemo(() => {
    return [...dynamicData.candlestick].sort((a, b) => {
      const timeA = getTimestamp(a.time);
      const timeB = getTimestamp(b.time);
      return timeA - timeB;
    });
  }, [dynamicData.candlestick]);

  const sortedVolumeData = useMemo(() => {
    return [...dynamicData.volume].sort((a, b) => {
      const timeA = getTimestamp(a.time);
      const timeB = getTimestamp(b.time);
      return timeA - timeB;
    });
  }, [dynamicData.volume]);

  const coloredVolumeData = useMemo(() => {
    return sortedVolumeData.map((vol, index) => {
      const candle = sortedData[index];
      if (!candle) return vol;
      const isUp = candle.close >= candle.open;
      return {
        ...vol,
        color: isUp ? colors.upAlpha : colors.downAlpha,
      };
    });
  }, [sortedVolumeData, sortedData, colors.upAlpha, colors.downAlpha]);

  // 只在必要時建立/銷毀 chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    setContainerWidth(chartContainerRef.current.clientWidth);

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: height,
      layout: {
        background: { color: "#0d1117" },
        textColor: "#d1d5db",
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: "#1f2937" },
        horzLines: { color: "#1f2937" },
      },
      crosshair: {
        mode: 1,
        vertLine: { width: 1, color: "#6b7280", style: 2 },
        horzLine: { width: 1, color: "#6b7280", style: 2 },
      },
      rightPriceScale: {
        borderColor: "#374151",
        scaleMargins: { top: 0.1, bottom: 0.2 },
      },
      timeScale: {
        borderColor: "#374151",
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 5,
        fixRightEdge: true,
      },
      localization: {
        timeFormatter: () => "",
      },
    });

    chartRef.current = chart;

    // 先用預設顏色建立 series
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderUpColor: "#26a69a",
      borderDownColor: "#ef5350",
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });
    candlestickSeriesRef.current = candlestickSeries;

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "",
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });
    volumeSeriesRef.current = volumeSeries;

    const handleResize = () => {
      if (chartContainerRef.current) {
        const newWidth = chartContainerRef.current.clientWidth;
        chart.applyOptions({ width: newWidth });
        setContainerWidth(newWidth);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
      candlestickSeriesRef.current = null;
      volumeSeriesRef.current = null;
    };
  }, [height]);

  useEffect(() => {
    if (!candlestickSeriesRef.current) return;

    candlestickSeriesRef.current.applyOptions({
      upColor: colors.up,
      downColor: colors.down,
      borderUpColor: colors.up,
      borderDownColor: colors.down,
      wickUpColor: colors.up,
      wickDownColor: colors.down,
    });
  }, [colors.up, colors.down]);

  useEffect(() => {
    if (!chartRef.current) return;

    const localization = getTimeScaleLocalization(locale);
    chartRef.current.applyOptions({
      localization: {
        locale: localization.locale,
        timeFormatter: () => "",
      },
    });
  }, [locale]);

  const prevDataLengthRef = useRef(0);
  const shouldFitContentRef = useRef(true);

  useEffect(() => {
    if (
      !candlestickSeriesRef.current ||
      !volumeSeriesRef.current ||
      !chartRef.current
    )
      return;

    candlestickSeriesRef.current.setData(sortedData as CandlestickData<Time>[]);
    volumeSeriesRef.current.setData(coloredVolumeData);

    // 只在初次載入或切換 Time Frame 時 fitContent
    const isNewDataSet =
      sortedData.length < prevDataLengthRef.current ||
      shouldFitContentRef.current;
    if (isNewDataSet) {
      chartRef.current.timeScale().fitContent();
      shouldFitContentRef.current = false;
    }
    prevDataLengthRef.current = sortedData.length;
  }, [sortedData, coloredVolumeData]);

  useEffect(() => {
    shouldFitContentRef.current = true;
  }, [timeFrame]);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = chartRef.current;

    let isReady = false;
    const readyTimeout = setTimeout(() => {
      isReady = true;
    }, 500);

    const handleVisibleLogicalRangeChange = () => {
      const logicalRange = chart.timeScale().getVisibleLogicalRange();
      if (!logicalRange) return;

      if (
        logicalRange.from < 5 &&
        !isLoadingRef.current &&
        sortedData.length > 0 &&
        isReady
      ) {
        isLoadingRef.current = true;

        setTimeout(() => {
          loadCountRef.current += 1;
          const earliestData = sortedData[0];
          const earliestTimestamp = getTimestamp(earliestData.time);
          const newData = generateHistoricalData(
            timeFrame,
            earliestTimestamp,
            30,
            loadCountRef.current * 1000
          );

          setDynamicData((prev) => ({
            candlestick: [...newData.candlestick, ...prev.candlestick],
            volume: [...newData.volume, ...prev.volume],
          }));

          setTimeout(() => {
            isLoadingRef.current = false;
          }, 500);
        }, 0);
      }
    };

    chart
      .timeScale()
      .subscribeVisibleLogicalRangeChange(handleVisibleLogicalRangeChange);

    return () => {
      clearTimeout(readyTimeout);
      chart
        .timeScale()
        .unsubscribeVisibleLogicalRangeChange(handleVisibleLogicalRangeChange);
    };
  }, [sortedData, timeFrame]);

  useEffect(() => {
    if (!chartRef.current || !candlestickSeriesRef.current) return;

    const chart = chartRef.current;
    const candlestickSeries = candlestickSeriesRef.current;

    const handleCrosshairMove = (param: {
      time?: Time;
      point?: { x: number; y: number };
      seriesData?: Map<unknown, unknown>;
    }) => {
      if (!param.time || !param.point || !param.seriesData) {
        setTooltipInfo(null);
        return;
      }

      const candleData = param.seriesData.get(candlestickSeries) as
        | CandlestickDataPoint
        | undefined;
      if (!candleData) {
        setTooltipInfo(null);
        return;
      }

      const volumeData = sortedVolumeData.find((v) => {
        const vTime = getTimestamp(v.time);
        const cTime = getTimestamp(candleData.time);
        return vTime === cTime;
      });

      const currentIndex = sortedData.findIndex((d) => {
        const dTime = getTimestamp(d.time);
        const cTime = getTimestamp(candleData.time);
        return dTime === cTime;
      });
      const prevCandle = currentIndex > 0 ? sortedData[currentIndex - 1] : null;
      const prevClose = prevCandle?.close ?? candleData.open;
      const changePercent = ((candleData.close - prevClose) / prevClose) * 100;

      const isUp =
        colorScheme === "greenRed"
          ? candleData.close >= candleData.open
          : candleData.close < candleData.open;

      setTooltipInfo({
        time: formatTime(candleData.time),
        open: candleData.open,
        high: candleData.high,
        low: candleData.low,
        close: candleData.close,
        volume: volumeData?.value ?? 0,
        changePercent,
        isUp,
      });

      setTooltipPosition({ x: param.point.x, y: param.point.y });
    };

    chart.subscribeCrosshairMove(handleCrosshairMove);

    return () => {
      chart.unsubscribeCrosshairMove(handleCrosshairMove);
    };
  }, [sortedData, sortedVolumeData, colorScheme, formatTime]);

  const latestPrice = sortedData[sortedData.length - 1]?.close ?? 0;
  const previousPrice = sortedData[sortedData.length - 2]?.close ?? 0;
  const priceChange = latestPrice - previousPrice;
  const priceChangePercent = previousPrice
    ? ((priceChange / previousPrice) * 100).toFixed(2)
    : "0.00";
  const isPositive =
    colorScheme === "greenRed" ? priceChange >= 0 : priceChange < 0;

  const timeFrames: TimeFrame[] = ["15m", "1h", "4h", "1d"];

  return (
    <div className="w-full rounded-xl border border-gray-800 bg-[#0d1117] p-4">
      <div className="mb-4 flex flex-col gap-2">
        {/* 幣種 */}
        <h2 className="text-lg font-semibold text-gray-100">{symbol}</h2>

        {/* 價格 */}
        <p className="text-2xl font-bold text-gray-100">
          ${latestPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </p>

        {/* 漲跌幅 */}
        <p
          className={`text-sm font-medium ${
            isPositive ? "text-emerald-500" : "text-red-500"
          }`}
        >
          {priceChange >= 0 ? "+" : ""}
          {priceChange.toFixed(2)} ({priceChange >= 0 ? "+" : ""}
          {priceChangePercent}%)
        </p>

        {/* Time Frame Buttons */}
        <div className="flex gap-2">
          {timeFrames.map((tf) => (
            <button
              key={tf}
              onClick={() => handleTimeFrameChange(tf)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                timeFrame === tf
                  ? "bg-amber-500/20 text-amber-500"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300"
              }`}
            >
              {t(tf)}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Container */}
      <div ref={chartContainerRef} className="relative w-full rounded-lg">
        {tooltipInfo && (
          <div
            className="pointer-events-none absolute z-10 rounded-lg border border-gray-700 bg-gray-900/95 p-3 text-xs shadow-xl backdrop-blur-sm"
            style={{
              left: Math.min(tooltipPosition.x + 16, containerWidth - 200),
              top: Math.max(tooltipPosition.y - 100, 10),
            }}
          >
            <div className="mb-2 border-b border-gray-700 pb-2">
              <span className="text-gray-400">{t("time")}:</span>
              <span className="ml-1 text-gray-100">{tooltipInfo.time}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
              <div className="flex justify-between">
                <span className="whitespace-nowrap text-gray-400">
                  {t("open")}
                </span>
                <span className="ml-2 text-gray-100">
                  ${tooltipInfo.open.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="whitespace-nowrap text-gray-400">
                  {t("close")}
                </span>
                <span
                  className={`ml-2 ${
                    tooltipInfo.isUp ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  ${tooltipInfo.close.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="whitespace-nowrap text-gray-400">
                  {t("high")}
                </span>
                <span className="ml-2 text-gray-100">
                  ${tooltipInfo.high.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="whitespace-nowrap text-gray-400">
                  {t("low")}
                </span>
                <span className="ml-2 text-gray-100">
                  ${tooltipInfo.low.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="whitespace-nowrap text-gray-400">
                  {t("change")}
                </span>
                <span
                  className={`ml-2 ${
                    tooltipInfo.changePercent >= 0
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {tooltipInfo.changePercent >= 0 ? "+" : ""}
                  {tooltipInfo.changePercent.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="whitespace-nowrap text-gray-400">
                  {t("volume")}
                </span>
                <span className="ml-2 text-gray-100">
                  {tooltipInfo.volume.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
