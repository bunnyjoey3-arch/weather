"use client";

import { useEffect, useRef, useState } from "react";
import type { GeoResult } from "../types";

interface Props {
  onSelect: (city: GeoResult) => void;
  onSubmit: (raw: string) => void;
}

export default function SearchBar({ onSelect, onSubmit }: Props) {
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState<GeoResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);

  // Debounced autocomplete: wait 400ms after the user stops typing,
  // then fetch city suggestions from our /api/search endpoint.
  useEffect(() => {
    const q = value.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        setSuggestions(data.results ?? []);
        setOpen(true);
        setHighlight(-1);
      } catch {
        // aborted or network error — ignore
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value]);

  // Close dropdown when clicking outside.
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function choose(s: GeoResult) {
    setValue(s.name);
    setOpen(false);
    setSuggestions([]);
    onSelect(s);
  }

  function submitRaw() {
    const q = value.trim();
    if (!q) return;
    setOpen(false);
    onSubmit(q);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) {
      if (e.key === "Enter") submitRaw();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlight >= 0) choose(suggestions[highlight]);
      else submitRaw();
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={boxRef} className="relative w-full">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/60">
            🔍
          </span>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={() => suggestions.length && setOpen(true)}
            placeholder="Search for a city…"
            className="w-full rounded-2xl bg-white/15 py-3.5 pl-11 pr-4 text-white placeholder-white/50 outline-none ring-1 ring-white/20 transition focus:bg-white/20 focus:ring-2 focus:ring-sky-300"
            aria-label="City search"
          />
          {loading && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          )}
        </div>
        <button
          onClick={submitRaw}
          className="rounded-2xl bg-sky-400 px-5 py-3.5 font-semibold text-slate-900 shadow-lg transition hover:bg-sky-300 active:scale-95"
        >
          Search
        </button>
      </div>

      {open && suggestions.length > 0 && (
        <ul className="thin-scroll glass absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-2xl p-1.5 shadow-2xl">
          {suggestions.map((s, i) => (
            <li key={`${s.latitude}-${s.longitude}-${i}`}>
              <button
                onMouseEnter={() => setHighlight(i)}
                onClick={() => choose(s)}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-left transition ${
                  highlight === i ? "bg-white/25" : "hover:bg-white/15"
                }`}
              >
                <span className="font-medium">{s.name}</span>
                <span className="text-sm text-white/60">
                  {[s.admin1, s.country].filter(Boolean).join(", ")}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
