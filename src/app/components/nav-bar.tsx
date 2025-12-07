"use client";

import { Bell, Globe } from "lucide-react";
import type { ColorScheme } from "../data/mock-chart-data";
import { type Locale, LOCALE_LABELS, getTranslation } from "../lib/i18n";

interface NavBarProps {
  colorScheme: ColorScheme;
  onColorSchemeChange: (scheme: ColorScheme) => void;
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
}

export default function NavBar({
  colorScheme,
  onColorSchemeChange,
  locale,
  onLocaleChange,
}: NavBarProps) {
  const t = (key: Parameters<typeof getTranslation>[1]) =>
    getTranslation(locale, key);

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-800 bg-[#0d1117]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* Logo / Title */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-100">
            {t("appName")}
          </span>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-4">
          {/* Color Scheme Toggle */}
          <div className="flex items-center rounded-lg border border-gray-700 bg-gray-800/50 p-1">
            <button
              onClick={() => onColorSchemeChange("greenRed")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                colorScheme === "greenRed"
                  ? "bg-gray-700 text-gray-100"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
              <span className="h-2.5 w-2.5 rounded-sm bg-red-500" />
            </button>
            <button
              onClick={() => onColorSchemeChange("redGreen")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                colorScheme === "redGreen"
                  ? "bg-gray-700 text-gray-100"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              <span className="h-2.5 w-2.5 rounded-sm bg-red-500" />
              <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
            </button>
          </div>

          <div className="flex items-center rounded-lg border border-gray-700 bg-gray-800/50 p-1">
            <Globe className="mx-2 h-4 w-4 text-gray-400" />
            {(["zh-TW", "en"] as Locale[]).map((loc) => (
              <button
                key={loc}
                onClick={() => onLocaleChange(loc)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  locale === loc
                    ? "bg-gray-700 text-gray-100"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                {LOCALE_LABELS[loc]}
              </button>
            ))}
          </div>

          {/* Notification Icon */}
          <button
            className="relative rounded-lg border border-gray-700 bg-gray-800/50 p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-gray-300"
            aria-label={t("notifications")}
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              3
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}
