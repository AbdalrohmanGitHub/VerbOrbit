"use client";

import type { VerbChunk } from "@/types/verb.schema";

export function ChunkSelectorPills({
  chunks,
  activeId,
  onSelect,
}: {
  chunks: VerbChunk[];
  activeId: string;
  onSelect: (chunkId: string) => void;
}) {
  const visible = chunks.slice(0, 2);
  const rest = chunks.slice(2);
  return (
    <div className="flex flex-wrap gap-2">
      {visible.map((chunk) => (
        <button
          key={chunk.chunk_id}
          type="button"
          className={`min-h-11 rounded-full px-3 text-sm font-extrabold ${chunk.chunk_id === activeId ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-800"}`}
          onClick={() => onSelect(chunk.chunk_id)}
        >
          {chunk.short_badge}
        </button>
      ))}
      {rest.length > 0 ? (
        <details className="min-h-11">
          <summary className="cursor-pointer list-none rounded-full bg-slate-100 px-3 py-3 text-sm font-extrabold">
            Weitere Bedeutung
          </summary>
          <div className="mt-2 flex flex-wrap gap-2">
            {rest.map((chunk) => (
              <button
                key={chunk.chunk_id}
                type="button"
                className="min-h-11 rounded-full bg-slate-100 px-3 text-sm font-extrabold"
                onClick={() => onSelect(chunk.chunk_id)}
              >
                {chunk.short_badge}
              </button>
            ))}
          </div>
        </details>
      ) : null}
    </div>
  );
}
