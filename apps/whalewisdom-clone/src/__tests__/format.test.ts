import { formatNumber, formatPercent } from "../utils/format";

test("formatNumber adds commas", () => {
  expect(formatNumber(1234567)).toBe("1,234,567");
});

test("formatPercent formats to 2 decimals", () => {
  expect(formatPercent(0.1234)).toBe("12.34%");
});
