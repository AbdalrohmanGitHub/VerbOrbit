"use client";

import type { IconKey } from "@/types/verb.schema";

export function DualCodingAnimator({ icon, color }: { icon: IconKey | null; color: string }) {
  if (!icon) return null;
  return (
    <svg
      viewBox="0 0 64 64"
      className="h-16 w-16 rounded-2xl border bg-white p-2"
      style={{ borderColor: color }}
      aria-hidden="true"
    >
      <IconShape icon={icon} color={color} />
    </svg>
  );
}

function IconShape({ icon, color }: { icon: IconKey; color: string }) {
  const common = { fill: "none", stroke: color, strokeWidth: 3, strokeLinecap: "round" as const };
  if (icon === "arrive") return <path {...common} d="M12 40h28l8-16M44 20v8M32 44v8" />;
  if (icon === "up_open") return <path {...common} d="M18 40V22m14 18V22M14 22h22M32 18l8 8" />;
  if (icon === "enter") return <path {...common} d="M16 16h20v32H16M28 32h20M40 24l8 8-8 8" />;
  if (icon === "forward") return <path {...common} d="M12 32h32M36 20l12 12-12 12" />;
  if (icon === "down_off") return <path {...common} d="M32 14v28M20 32l12 12 12-12" />;
  if (icon === "out_exit") return <path {...common} d="M18 16h16v32H18M30 32h18M40 24l8 8-8 8" />;
  if (icon === "return") return <path {...common} d="M46 24H22M22 24l10-8M22 24l10 8M18 40h28" />;
  if (icon === "together") return <path {...common} d="M20 40c0-10 8-16 12-16s12 6 12 16M24 22a6 6 0 1 0 0-8M40 22a6 6 0 1 0 0-8" />;
  return <path {...common} d="M18 18h20v12H26v16h20" />;
}
