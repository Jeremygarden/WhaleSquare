import { useMemo, useRef, useState } from "react";
import { formatNumber } from "../utils/format";

type TrendPoint = { quarter: string; value: number };

type TooltipState = {
  label: string;
  value: string;
  x: number;
  y: number;
};

const getSmoothPath = (points: { x: number; y: number }[]) => {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return path;
};

export function ValueTrend({ data }: { data: TrendPoint[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const chart = useMemo(() => {
    const width = 720;
    const height = 220;
    const padding = 32;

    const values = data.map((point) => point.value);
    const min = Math.min(...values, 0);
    const max = Math.max(...values, 1);
    const range = max - min || 1;

    const points = data.map((point, index) => {
      const x = padding + (index / Math.max(data.length - 1, 1)) * (width - padding * 2);
      const y =
        padding + (1 - (point.value - min) / range) * (height - padding * 2);
      return { ...point, x, y };
    });

    return { width, height, padding, points };
  }, [data]);

  const path = useMemo(
    () => getSmoothPath(chart.points.map((point) => ({ x: point.x, y: point.y }))),
    [chart.points]
  );

  const handleHover = (
    event: React.MouseEvent<SVGCircleElement>,
    label: string,
    value: number
  ) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    setTooltip({
      label,
      value: `$${formatNumber(value)}`,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  return (
    <div className="card chart-card" ref={containerRef}>
      <div>
        <div className="chart-title">Portfolio Value Trend</div>
        <div className="chart-subtitle">Quarterly portfolio value</div>
      </div>
      <div style={{ position: "relative" }}>
        <svg
          viewBox={`0 0 ${chart.width} ${chart.height}`}
          width="100%"
          height={chart.height}
          role="img"
          aria-label="Portfolio value trend chart"
        >
          {[0, 0.5, 1].map((tick) => {
            const y = chart.padding + tick * (chart.height - chart.padding * 2);
            return (
              <line
                key={tick}
                x1={chart.padding}
                x2={chart.width - chart.padding}
                y1={y}
                y2={y}
                stroke="rgba(148, 163, 184, 0.2)"
                strokeDasharray="4 6"
              />
            );
          })}
          <path
            d={path}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth={3}
          />
          {chart.points.map((point) => (
            <g key={point.quarter}>
              <circle
                cx={point.x}
                cy={point.y}
                r={5}
                fill="var(--color-accent)"
                stroke="var(--color-surface)"
                strokeWidth={2}
              />
              <circle
                cx={point.x}
                cy={point.y}
                r={10}
                fill="transparent"
                onMouseMove={(event) =>
                  handleHover(event, point.quarter, point.value)
                }
                onMouseLeave={() => setTooltip(null)}
                style={{ cursor: "pointer" }}
              />
              <text
                x={point.x}
                y={chart.height - 8}
                textAnchor="middle"
                fill="var(--color-text-muted)"
                fontSize="11"
                fontFamily="var(--font-mono)"
              >
                {point.quarter}
              </text>
            </g>
          ))}
        </svg>
        {tooltip && (
          <div className="chart-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
            <span>{tooltip.label}</span>
            <strong className="chart-mono">{tooltip.value}</strong>
          </div>
        )}
      </div>
    </div>
  );
}
