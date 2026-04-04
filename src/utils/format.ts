export function formatNumber(value: number) {
  return value.toLocaleString("en-US");
}

export function formatPercent(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}
