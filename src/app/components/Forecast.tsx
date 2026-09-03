"use client";

import type { ForecastDay, Unit } from "../types";

function toDisplay(celsius: number, unit: Unit) {
  return unit === "C" ? celsius : Math.round((celsius * 9) / 5 + 32);
}

interface Props {
  forecast: ForecastDay[];
  unit: Unit;
}

export default function Forecast({ forecast, unit }: Props) {
  if (forecast.length === 0) return null;

  return (
    <div className="animate-fade-up">
      <h3 className="mb-3 text-lg font-semibold text-white/90">
        5-Day Forecast
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {forecast.map((day) => (
          <div
            key={day.date}
            className="glass flex flex-col items-center gap-1 rounded-2xl p-4 text-center transition hover:-translate-y-1 hover:bg-white/20"
          >
            <div className="font-semibold">{day.label}</div>
            <div className="text-xs text-white/60">
              {new Date(day.date + "T00:00:00").toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </div>
            <div className="my-1 text-4xl">{day.icon}</div>
            <div className="text-xs capitalize text-white/70">
              {day.description}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="font-semibold">
                {toDisplay(day.max, unit)}°
              </span>
              <span className="text-white/50">
                {toDisplay(day.min, unit)}°
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
