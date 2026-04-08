import { test, expect } from "vitest";
import { formatNumber, formatPercent } from "../utils/format";

test("formatNumber adds commas", () => {
  expect(formatNumber(1234567)).toBe("1,234,567");
});

test("formatPercent formats to 2 decimals", () => {
  expect(formatPercent(12.34)).toBe("12.34%");
});
