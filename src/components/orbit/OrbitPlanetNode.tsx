"use client";

import { planetSurface } from "@/core/compassEngine";

export type OrbitPlanet = {
  id: string;
  label: string;
  angle: number;
  separable: boolean;
  color: string;
  placeholder?: boolean;
  quiet?: boolean;
};

export function OrbitPlanetNode({
  planet,
  x,
  y,
  selected,
  onSelect,
}: {
  planet: OrbitPlanet;
  x: number;
  y: number;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const surface = planetSurface(planet.color);
  return (
    <button
      type="button"
      tabIndex={-1}
      id={`planet-${planet.id}`}
      className={`absolute z-10 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-center text-xs font-extrabold shadow-md ${selected ? "ring-4 ring-slate-900/20" : ""} ${planet.quiet ? "opacity-40" : ""}`}
      style={{
        left: x,
        top: y,
        background: planet.placeholder ? "#f8fafc" : surface.background,
        color: surface.color,
        borderColor: surface.border,
        borderStyle: planet.separable ? "dashed" : "solid",
      }}
      onClick={() => onSelect(planet.id)}
    >
      {planet.label}
    </button>
  );
}
