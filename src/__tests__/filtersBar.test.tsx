/** @vitest-environment jsdom */
import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { test, expect, vi, afterEach } from "vitest";
import { FiltersBar } from "../components/FiltersBar";

afterEach(() => cleanup());

test("emits search changes", () => {
  const onSearch = vi.fn();
  const onSort = vi.fn();
  render(<FiltersBar onSearch={onSearch} onSort={onSort} />);
  fireEvent.change(screen.getByPlaceholderText("Search by name or ticker"), { target: { value: "AAPL" } });
  expect(onSearch).toHaveBeenCalledWith("AAPL");
});

test("emits sort changes", () => {
  const onSearch = vi.fn();
  const onSort = vi.fn();
  render(<FiltersBar onSearch={onSearch} onSort={onSort} />);
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "shares" } });
  expect(onSort).toHaveBeenCalledWith("shares");
});

test("emits sort changes", () => {
  const onSearch = vi.fn();
  const onSort = vi.fn();
  render(<FiltersBar onSearch={onSearch} onSort={onSort} />);
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "shares" } });
  expect(onSort).toHaveBeenCalledWith("shares");
});
