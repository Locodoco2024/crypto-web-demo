"use client";

import { useState } from "react";
import PriceChart from "./components/price-chart";
import NavBar from "./components/nav-bar";
import type { TimeFrame, ColorScheme } from "./data/mock-chart-data";
import type { Locale } from "./lib/i18n";

export default function Home() {
  const [colorScheme, setColorScheme] = useState<ColorScheme>("greenRed");
  const [locale, setLocale] = useState<Locale>("zh-TW");

  const handleTimeFrameChange = (tf: TimeFrame) => {
    console.log("Time frame changed:", tf);
  };

  return (
    <div className="min-h-screen bg-[#010409]">
      <NavBar
        colorScheme={colorScheme}
        onColorSchemeChange={setColorScheme}
        locale={locale}
        onLocaleChange={setLocale}
      />

      <main className="p-6">
        <div className="mx-auto max-w-5xl">
          <PriceChart
            symbol="BTC/USDT"
            height={500}
            colorScheme={colorScheme}
            defaultTimeFrame="1d"
            onTimeFrameChange={handleTimeFrameChange}
            locale={locale}
          />
        </div>
      </main>
    </div>
  );
}
