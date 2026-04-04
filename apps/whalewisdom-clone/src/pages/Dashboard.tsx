import { useHoldingsStore } from "../store/useHoldingsStore";
import { useEffect } from "react";
import { HoldingsTable } from "../components/HoldingsTable";
import { FiltersBar } from "../components/FiltersBar";

export default function Dashboard() {
  const { institution, loadMock } = useHoldingsStore();
  useEffect(() => { loadMock(); }, [loadMock]);

  if (!institution) return <div className="card p-6">Loading…</div>;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <FiltersBar onSearch={() => {}} />
      <HoldingsTable holdings={institution.holdings} />
    </div>
  );
}
