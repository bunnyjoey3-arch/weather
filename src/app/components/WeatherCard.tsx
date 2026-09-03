"use client";

import type { CurrentWeather, Unit } from "../types";

function toDisplay(celsius: number, unit: Unit) {
  return unit === "C" ? celsius : Math.round((celsius * 9) / 5 + 32);
}

interface Props {
  current: CurrentWeather;
  unit: Unit;
}

export default function WeatherCard({ current, unit }: Props) {
  const place = [current.city, current.country].filter(Boolean).join(", ");
  const time = new Date(current.localTime).toLocaleString(undefined, {
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

  const stats = [
    { label: "Feels like", value: `${toDisplay(current.feelsLike, unit)}°`, icon: "🌡️" },
    { label: "Humidity", value: `${current.humidity}%`, icon: "💧" },
    { label: "Wind", value: `${current.windSpeed} km/h`, icon: "💨" },
    { label: "Pressure", value: `${current.pressure} hPa`, icon: "📊" },
  ];

  return (
    <div className="glass animate-fade-up rounded-3xl p-6 shadow-2xl sm:p-8">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
        <div className="text-center sm:text-left">
          <h2 className="text-2xl font-bold sm:text-3xl">{place}</h2>
          <p className="mt-1 text-sm text-white/70">{time}</p>
          <p className="mt-3 text-lg capitalize text-white/90">
            {current.description}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-6xl drop-shadow-lg sm:text-7xl">
            {current.icon}
          </span>
          <div className="flex items-start">
            <span className="text-6xl font-extrabold tracking-tight sm:text-7xl">
              {toDisplay(current.temperature, unit)}
            </span>
            <span className="mt-2 text-2xl font-semibold text-white/80">
              °{unit}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl bg-white/10 p-4 text-center ring-1 ring-white/10"
          >
            <div className="text-2xl">{s.icon}</div>
            <div className="mt-1 text-xs uppercase tracking-wide text-white/60">
              {s.label}
            </div>
            <div className="mt-0.5 text-lg font-semibold">{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
