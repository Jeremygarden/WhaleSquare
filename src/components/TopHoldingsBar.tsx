import { useMemo, useRef, useState } from "react";
import type { Holding } from "../data/types";
import { formatNumber } from "../utils/format";

type TooltipState = {
  label: string;
  value: string;
  delta: string;
  x: number;
  y: number;
};

export function TopHoldingsBar({ holdings }: { holdings: Holding[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const data = useMemo(() => {
    return [...holdings]
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [holdings]);

  const maxValue = Math.max(...data.map((item) => item.value), 1);
  const maxDelta = Math.max(...data.map((item) => Math.abs(item.changeShares)), 1);

  const chartWidth = 520;
  const labelWidth = 120;
  const barHeight = 16;
  const barGap = 12;
  const chartHeight = data.length * (barHeight + barGap) + 10;

  const handleHover = (
    event: React.MouseEvent<SVGRectElement>,
    label: string,
    value: number,
    delta: number
  ) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    setTooltip({
      label,
      value: `$${formatNumber(value)}`,
      delta: `${delta >= 0 ? "+" : ""}${formatNumber(delta)} shares`,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  return (
    <div className="card chart-card" ref={containerRef}>
      <div>
        <div className="chart-title">Top Holdings</div>
        <div className="chart-subtitle">Value with delta share overlay</div>
      </div>
      <div style={{ position: "relative" }}>
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} width="100%" height={chartHeight}>
          {data.map((item, index) => {
            const y = 5 + index * (barHeight + barGap);
            const valueWidth =
              ((chartWidth - labelWidth - 20) * item.value) / maxValue;
            const deltaWidth =
              ((chartWidth - labelWidth - 20) * Math.abs(item.changeShares)) /
              maxDelta;
            const deltaColor =
              item.changeShares >= 0 ? "var(--color-success)" : "var(--color-danger)";

            return (
              <g key={item.cusip}>
                <text
                  x={0}
                  y={y + barHeight * 0.8}
                  fill="var(--color-text)"
                  fontSize="12"
                  fontFamily="var(--font-mono)"
                >
                  {item.ticker}
                </text>
                <rect
                  x={labelWidth}
                  y={y}
                  width={valueWidth}
                  height={barHeight}
                  rx={6}
                  fill="var(--color-accent)"
                  opacity={0.85}
                  onMouseMove={(event) =>
                    handleHover(event, item.name, item.value, item.changeShares)
                  }
                  onMouseLeave={() => setTooltip(null)}
                />
                {item.changeShares !== 0 && (
                  <rect
                    x={labelWidth}
                    y={y + barHeight * 0.3}
                    width={deltaWidth}
                    height={barHeight * 0.4}
                    rx={4}
                    fill={deltaColor}
                    opacity={0.9}
                  />
                )}
                <text
                  x={chartWidth}
                  y={y + barHeight * 0.8}
                  textAnchor="end"
                  fill="var(--color-text-muted)"
                  fontSize="12"
                  fontFamily="var(--font-mono)"
                >
                  ${formatNumber(item.value)}
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
