import { useMemo, useRef, useState } from "react";
import type { Holding } from "../data/types";

type TooltipState = { label: string; value: string; delta: string; x: number; y: number };

function shortName(name: string, max = 14): string {
  if (name.length <= max) return name;
  return name.slice(0, max - 1) + "…";
}

function formatValue(v: number): string {
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(0)}M`;
  return `$${v.toLocaleString("en-US")}`;
}

export function TopHoldingsBar({ holdings }: { holdings: Holding[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const data = useMemo(
    () => [...holdings].sort((a, b) => b.value - a.value).slice(0, 10),
    [holdings]
  );

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const maxDelta = Math.max(...data.map((d) => Math.abs(d.changeShares)), 1);

  // Layout columns (SVG units)
  const W = 600;           // total viewBox width
  const nameW = 90;        // name label column
  const valueW = 72;       // value label column (right side)
  const gap = 6;
  const barAreaX = nameW + gap;
  const barAreaW = W - nameW - gap - gap - valueW;  // ~432
  const barH = 16;
  const rowGap = 10;
  const H = data.length * (barH + rowGap) + 4;

  const handleHover = (e: React.MouseEvent<SVGRectElement>, item: Holding) => {
    const r = containerRef.current?.getBoundingClientRect();
    if (!r) return;
    setTooltip({
      label: item.name,
      value: formatValue(item.value),
      delta: `${item.changeShares >= 0 ? "+" : ""}${item.changeShares.toLocaleString()} sh`,
      x: e.clientX - r.left,
      y: e.clientY - r.top,
    });
  };

  return (
    <div className="card chart-card" ref={containerRef}>
      <div>
        <div className="chart-title">Top Holdings</div>
        <div className="chart-subtitle">Value with delta share overlay</div>
      </div>
      <div style={{ position: "relative" }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          height={H}
          role="img"
          aria-label="Top holdings bar chart"
        >
          {data.map((item, i) => {
            const y = 2 + i * (barH + rowGap);
            const bw = (barAreaW * item.value) / maxValue;
            const dw = (barAreaW * Math.abs(item.changeShares)) / maxDelta;
            const dc = item.changeShares >= 0 ? "var(--color-success)" : "var(--color-danger)";
            const label = shortName(item.ticker || item.name);

            return (
              <g key={item.cusip + i}>
                {/* Name */}
                <text
                  x={nameW}
                  y={y + barH * 0.78}
                  textAnchor="end"
                  fill="var(--color-text)"
                  fontSize="10"
                  fontFamily="var(--font-mono)"
                >
                  {label}
                </text>
                {/* Value bar */}
                <rect
                  x={barAreaX}
                  y={y}
                  width={bw}
                  height={barH}
                  rx={4}
                  fill="var(--color-accent)"
                  opacity={0.85}
                  style={{ cursor: "pointer" }}
                  onMouseMove={(e) => handleHover(e, item)}
                  onMouseLeave={() => setTooltip(null)}
                />
                {/* Delta overlay */}
                {item.changeShares !== 0 && (
                  <rect
                    x={barAreaX}
                    y={y + barH * 0.3}
                    width={Math.min(dw, bw)}
                    height={barH * 0.4}
                    rx={3}
                    fill={dc}
                    opacity={0.9}
                    style={{ pointerEvents: "none" }}
                  />
                )}
                {/* Value label — right column */}
                <text
                  x={W}
                  y={y + barH * 0.78}
                  textAnchor="end"
                  fill="var(--color-text-muted)"
                  fontSize="10"
                  fontFamily="var(--font-mono)"
                >
                  {formatValue(item.value)}
                </text>
              </g>
            );
          })}
        </svg>
        {tooltip && (
          <div className="chart-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
            <span>{tooltip.label}</span>
            <strong className="chart-mono">{tooltip.value}</strong>
            <span className="chart-mono">{tooltip.delta}</span>
          </div>
        )}
      </div>
    </div>
  );
}
