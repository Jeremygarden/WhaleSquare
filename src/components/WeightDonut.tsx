import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Holding } from "../data/types";
import { formatPercent } from "../utils/format";

type TooltipState = {
  label: string;
  value: string;
  x: number;
  y: number;
};

const palette = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
  "var(--chart-8)",
];

export function WeightDonut({ holdings }: { holdings: Holding[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const slices = useMemo(() => {
    const sorted = [...holdings].sort((a, b) => b.weight - a.weight);
    const top = sorted.slice(0, 8);
    const topWeight = top.reduce((sum, holding) => sum + holding.weight, 0);
    const totalWeight = sorted.reduce((sum, holding) => sum + holding.weight, 0);
    const othersWeight = Math.max(0, totalWeight - topWeight);

    const topSlices = top.map((holding, index) => ({
      label: holding.name,
      weight: holding.weight,
      color: palette[index % palette.length],
    }));

    if (othersWeight > 0.0001) {
      topSlices.push({
        label: "Others",
        weight: othersWeight,
        color: "var(--color-border)",
      });
    }

    return topSlices;
  }, [holdings]);

  const total = slices.reduce((sum, slice) => sum + slice.weight, 0) || 1;
  const size = 200;
  const strokeWidth = 18;
  const radius = 70;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;

  const handleHover = (
    event: React.MouseEvent<SVGCircleElement>,
    label: string,
    weight: number
  ) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    setTooltip({
      label,
      value: formatPercent(weight),
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  return (
    <div className="card chart-card" ref={containerRef}>
      <div>
        <div className="chart-title">Portfolio Weight</div>
        <div className="chart-subtitle">Top positions by weight</div>
      </div>
      <div className="donut-layout">
        <div style={{ position: "relative", maxWidth: "300px", width: "100%" }}>
          <svg
            viewBox="0 0 200 200"
            width="100%"
            height="220"
            role="img"
            aria-label="Portfolio weight donut chart"
          >
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="rgba(148, 163, 184, 0.2)"
              strokeWidth={strokeWidth}
            />
            <g transform={`rotate(-90 ${center} ${center})`}>
              {slices.map((slice, index) => {
                const length = (slice.weight / total) * circumference;
                const dasharray = `${length} ${circumference - length}`;
                const dashoffset = -offset;
                offset += length;

                return (
                  <motion.circle
                    key={`${slice.label}-${index}`}
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={slice.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={dasharray}
                    strokeDashoffset={dashoffset}
                    strokeLinecap="butt"
                    initial={{ strokeDasharray: `0 ${circumference}` }}
                    animate={{ strokeDasharray: dasharray }}
                    transition={{ duration: 0.8, delay: index * 0.05 }}
                    onMouseMove={(event) =>
                      handleHover(event, slice.label, slice.weight)
                    }
                    onMouseLeave={() => setTooltip(null)}
                    style={{ cursor: "pointer" }}
                  />
                );
              })}
            </g>
          </svg>
          {tooltip && (
            <div className="chart-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
              <span>{tooltip.label}</span>
              <strong className="chart-mono">{tooltip.value}</strong>
            </div>
          )}
        </div>
        <div className="donut-legend">
          {slices.map((slice) => (
            <div key={slice.label} className="donut-item">
              <div className="donut-label">
                <span className="donut-swatch" style={{ background: slice.color }} />
                {slice.label}
              </div>
              <span className="chart-mono">{formatPercent(slice.weight)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
