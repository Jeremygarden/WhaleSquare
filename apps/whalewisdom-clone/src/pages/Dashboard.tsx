import { useHoldingsStore } from "../store/useHoldingsStore";
import { useEffect, useState } from "react";
import { HoldingsTable } from "../components/HoldingsTable";
import { FiltersBar } from "../components/FiltersBar";

export default function Dashboard() {
  const { institution, loadMock } = useHoldingsStore();
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"value" | "shares">("value");

  useEffect(() => {
    loadMock();
  }, [loadMock]);

  if (!institution) return <div className="card p-6">Loading…</div>;

  const filtered = institution.holdings
    .filter((h) =>
      h.name.toLowerCase().includes(query.toLowerCase()) ||
      h.ticker.toLowerCase().includes(query.toLowerCase())
    )
    .sort((a, b) =>
      sortBy === "value" ? b.value - a.value : b.shares - a.shares
    );

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <FiltersBar onSearch={setQuery} onSort={setSortBy} />
      <HoldingsTable holdings={filtered} />
    </div>
  );
}
