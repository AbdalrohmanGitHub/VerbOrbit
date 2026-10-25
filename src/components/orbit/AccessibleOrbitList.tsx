"use client";

export function AccessibleOrbitList({
  items,
  onSelect,
}: {
  items: { id: string; name: string }[];
  onSelect: (id: string) => void;
}) {
  return (
    <ul aria-label="Orbit, Tastatur und Screenreader" className="flex gap-2 overflow-x-auto px-3 pb-2">
      {items.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            id={`orbit-choice-${item.id}`}
            className="min-h-11 rounded-full bg-white px-3 text-sm font-extrabold text-slate-900 shadow"
            onClick={() => onSelect(item.id)}
          >
            {item.name}
          </button>
        </li>
      ))}
    </ul>
  );
}
