"use client";

import { useEffect, useRef, useState } from "react";
import { computePolarPosition } from "@/core/compassEngine";
import { AccessibleOrbitList } from "@/components/orbit/AccessibleOrbitList";
import { OrbitPlanetNode, type OrbitPlanet } from "@/components/orbit/OrbitPlanetNode";
import { TopParentBreadcrumb } from "@/components/orbit/TopParentBreadcrumb";

type CanvasProps = {
  planets: OrbitPlanet[];
  listItems: { id: string; name: string }[];
  centerTitle: string;
  centerKicker: string;
  parentTitle: string;
  parentKicker: string;
  selectedId: string | null;
  showInnerRing: boolean;
  page: number;
  pageCount: number;
  onPage: (page: number) => void;
  onSelect: (id: string) => void;
  onParent: () => void;
  onCenter: () => void;
};

export function MindlyOrbitCanvas(props: CanvasProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ width: 360, height: 460 });

  useEffect(() => {
    const node = stageRef.current;
    if (!node) return;
    const measure = () => setBox({ width: node.clientWidth, height: node.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const centerX = box.width / 2;
  const centerY = box.height * 0.56;
  const outer = Math.min(box.width, box.height) * 0.34;
  const inner = outer * 0.62;

  return (
    <section className="flex min-h-[520px] flex-1 flex-col">
      <div ref={stageRef} className="relative min-h-[460px] flex-1">
        <div aria-hidden="true" className="absolute inset-0">
          {props.showInnerRing ? (
            <div
              className="absolute rounded-full border border-indigo-200"
              style={{
                width: inner * 2,
                height: inner * 2,
                left: centerX - inner,
                top: centerY - inner,
              }}
            />
          ) : null}
          <div
            className="absolute rounded-full border border-dashed border-slate-300"
            style={{
              width: outer * 2,
              height: outer * 2,
              left: centerX - outer,
              top: centerY - outer,
            }}
          />
          <svg className="absolute inset-0 h-full w-full">
            {props.planets.map((planet) => {
              const point = computePolarPosition(centerX, centerY, outer, inner, planet.angle, planet.separable);
              return (
                <line
                  key={planet.id}
                  x1={centerX}
                  y1={centerY}
                  x2={point.x}
                  y2={point.y}
                  stroke={planet.color}
                  strokeWidth="2"
                  strokeDasharray={planet.separable ? "5 5" : undefined}
                  opacity="0.55"
                />
              );
            })}
          </svg>
          {props.planets.map((planet) => {
            const point = computePolarPosition(centerX, centerY, outer, inner, planet.angle, planet.separable);
            return (
              <OrbitPlanetNode
                key={planet.id}
                planet={planet}
                x={point.x}
                y={point.y}
                selected={planet.id === props.selectedId}
                onSelect={props.onSelect}
              />
            );
          })}
          <button
            type="button"
            id="center-verb"
            tabIndex={-1}
            onClick={props.onCenter}
            className="absolute z-20 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-blue-600 px-2 text-center text-white shadow-xl"
            style={{ left: centerX, top: centerY }}
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-100">{props.centerKicker}</span>
            <span className="text-xl font-extrabold leading-none">{props.centerTitle}</span>
          </button>
        </div>
        <TopParentBreadcrumb kicker={props.parentKicker} title={props.parentTitle} onClick={props.onParent} />
        {props.pageCount > 1 ? (
          <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white px-3 py-1 shadow">
            <button type="button" className="min-h-11 min-w-11 font-extrabold" onClick={() => props.onPage(props.page - 1)}>
              ‹
            </button>
            <span className="text-xs font-bold">
              {props.page + 1} / {props.pageCount}
            </span>
            <button type="button" className="min-h-11 min-w-11 font-extrabold" onClick={() => props.onPage(props.page + 1)}>
              ›
            </button>
          </div>
        ) : null}
      </div>
      <AccessibleOrbitList items={props.listItems} onSelect={props.onSelect} />
    </section>
  );
}
