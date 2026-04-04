/** @vitest-environment jsdom */
import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { test, expect, vi } from "vitest";
import { FiltersBar } from "../components/FiltersBar";

test("emits search changes", () => {
  const onSearch = vi.fn();
  render(<FiltersBar onSearch={onSearch} />);
  fireEvent.change(screen.getByPlaceholderText("Search by name or ticker"), { target: { value: "AAPL" } });
  expect(onSearch).toHaveBeenCalledWith("AAPL");
});
