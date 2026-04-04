/** @vitest-environment jsdom */
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { test, expect } from "vitest";
import { HoldingsTable } from "../components/HoldingsTable";
import { mockInstitution } from "../data/mock";

test("renders holding rows", () => {
  render(<HoldingsTable holdings={mockInstitution.holdings} />);
  expect(screen.getByText("Apple Inc.")).toBeInTheDocument();
  expect(screen.getByText("AAPL")).toBeInTheDocument();
});
