"use client";

import { useCallback, useEffect, useState } from "react";
import SearchBar from "./components/SearchBar";
import WeatherCard from "./components/WeatherCard";
import Forecast from "./components/Forecast";
import HistoryPanel from "./components/HistoryPanel";
import type { GeoResult, HistoryRow, Unit, WeatherBundle } from "./types";

export default function Home() {
  const [data, setData] = useState<WeatherBundle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unit, setUnit] = useState<Unit>("C");
  const [history, setHistory] = useState<HistoryRow[]>([]);

  const loadHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/history");
      const json = await res.json();
      setHistory(json.history ?? []);
    } catch {
      // ignore
    }
  }, []);

  const fetchWeather = useCallback(
    async (url: string) => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(url);
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error || "Unable to fetch weather data.");
        }
        setData(json);
        loadHistory();
      } catch (err) {
        setData(null);
        setError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    },
    [loadHistory]
  );

  const searchByName = useCallback(
    (raw: string) => {
      fetchWeather(`/api/weather?city=${encodeURIComponent(raw)}`);
    },
    [fetchWeather]
  );

  const searchByGeo = useCallback(
    (g: GeoResult) => {
      const params = new URLSearchParams({
        city: g.name,
        lat: String(g.latitude),
        lon: String(g.longitude),
      });
      if (g.country) params.set("country", g.country);
      fetchWeather(`/api/weather?${params.toString()}`);
    },
    [fetchWeather]
  );

  const pickHistory = useCallback(
    (row: HistoryRow) => {
      const params = new URLSearchParams({
        city: row.city,
        lat: String(row.latitude),
        lon: String(row.longitude),
      });
      if (row.country) params.set("country", row.country);
      fetchWeather(`/api/weather?${params.toString()}`);
    },
    [fetchWeather]
  );

  const clearHistory = useCallback(async () => {
    try {
      await fetch("/api/history", { method: "DELETE" });
      setHistory([]);
    } catch {
      // ignore
    }
  }, []);

  // Load history + a default city on first render.
  useEffect(() => {
    loadHistory();
    searchByName("London");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-4 py-8 sm:py-12">
      <header className="mb-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <div className="text-center sm:text-left">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            🌤️ Weather Dashboard
          </h1>
          <p className="mt-1 text-sm text-white/70">
            Real-time conditions & a 5-day forecast for any city.
          </p>
        </div>

        <div className="flex items-center rounded-full bg-white/10 p-1 ring-1 ring-white/20">
          {(["C", "F"] as Unit[]).map((u) => (
            <button
              key={u}
              onClick={() => setUnit(u)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                unit === u
                  ? "bg-sky-400 text-slate-900 shadow"
                  : "text-white/70 hover:text-white"
              }`}
            >
              °{u}
            </button>
          ))}
        </div>
      </header>

      <div className="mb-6">
        <SearchBar onSelect={searchByGeo} onSubmit={searchByName} />
      </div>

      <div className="space-y-6">
        {loading && (
          <div className="glass flex flex-col items-center gap-3 rounded-3xl py-16">
            <span className="h-10 w-10 animate-spin rounded-full border-4 border-white/30 border-t-white" />
            <p className="text-white/70">Loading weather…</p>
          </div>
        )}

        {!loading && error && (
          <div className="animate-fade-up rounded-3xl border border-red-300/40 bg-red-500/20 p-6 text-center">
            <div className="text-3xl">⚠️</div>
            <p className="mt-2 font-semibold">{error}</p>
            <p className="mt-1 text-sm text-white/70">
              Try searching for another city.
            </p>
          </div>
        )}

        {!loading && !error && data && (
          <>
            <WeatherCard current={data.current} unit={unit} />
            <Forecast forecast={data.forecast} unit={unit} />
          </>
        )}

        <HistoryPanel
          history={history}
          onPick={pickHistory}
          onClear={clearHistory}
        />
      </div>

      <footer className="mt-10 text-center text-xs text-white/40">
        Powered by Open-Meteo · Built with Next.js, Drizzle & PostgreSQL
      </footer>
    </main>
  );
}
