"use client";

import type { HistoryRow } from "../types";

interface Props {
  history: HistoryRow[];
  onPick: (row: HistoryRow) => void;
  onClear: () => void;
}

export default function HistoryPanel({ history, onPick, onClear }: Props) {
  if (history.length === 0) return null;

  return (
    <div className="glass animate-fade-up rounded-3xl p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-white/70">
          Recent Searches
        </h3>
        <button
          onClick={onClear}
          className="text-xs text-white/60 underline-offset-2 transition hover:text-white hover:underline"
        >
          Clear
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {history.map((row) => (
          <button
            key={row.id}
            onClick={() => onPick(row)}
            className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm ring-1 ring-white/15 transition hover:bg-white/20"
            title={`${row.temperature}° · ${row.description}`}
          >
            <span>{row.icon}</span>
            <span className="font-medium">{row.city}</span>
            {row.country && (
              <span className="text-white/50">{row.country}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
