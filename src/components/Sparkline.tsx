const DEFAULT_WIDTH = 120;
const DEFAULT_HEIGHT = 36;

function buildPath(points: Array<[number, number]>) {
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point[0]} ${point[1]}`)
    .join(" ");
}

export function Sparkline({ data }: { data: number[] }) {
  if (!data.length) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points: Array<[number, number]> = data.map((value, index) => {
    const x = (DEFAULT_WIDTH / (data.length - 1 || 1)) * index;
    const y = DEFAULT_HEIGHT - ((value - min) / range) * DEFAULT_HEIGHT;
    return [x, y];
  });

  return (
    <svg
      width={DEFAULT_WIDTH}
      height={DEFAULT_HEIGHT}
      viewBox={`0 0 ${DEFAULT_WIDTH} ${DEFAULT_HEIGHT}`}
      role="img"
      aria-label="Holdings sparkline"
    >
      <path
        d={buildPath(points)}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
