import { useHoldingsStore } from "../store/useHoldingsStore";
import { useEffect, useMemo, useState } from "react";
import { HoldingsTable } from "../components/HoldingsTable";
import { FiltersBar } from "../components/FiltersBar";
import { formatNumber } from "../utils/format";

export default function Dashboard() {
  const {
    institution,
    loadMock,
    loadReal,
    loading,
    selectedCik,
    selectedQuarter,
    setSelectedQuarter,
  } = useHoldingsStore();
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"value" | "shares">("value");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setError(null);
    loadReal(selectedCik).catch(() => {
      if (!active) return;
      setError("Live data unavailable — showing mock holdings.");
      loadMock();
    });
    return () => {
      active = false;
    };
  }, [loadMock, loadReal, selectedCik]);

  const metrics = useMemo(() => {
    if (!institution) return null;
    const holdingsCount = institution.holdings.length;
    const topHolding = [...institution.holdings].sort((a, b) => b.value - a.value)[0];
    return {
      totalValue: `$${formatNumber(institution.totalValue)}`,
      holdingsCount,
      topHolding,
      quarter: selectedQuarter || institution.quarter,
    };
  }, [institution, selectedQuarter]);

  if (loading && !institution) {
    return (
      <div className="dashboard">
        <div className="metrics">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="card metric-card">
              <div className="skeleton-line" style={{ width: "50%" }} />
              <div className="skeleton-line" style={{ width: "70%", height: 20 }} />
            </div>
          ))}
        </div>
        <div className="card table-card">
          <div className="table-skeleton">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="skeleton-row">
                <div className="skeleton-line" />
                <div className="skeleton-line" />
                <div className="skeleton-line" />
                <div className="skeleton-line" />
                <div className="skeleton-line" />
                <div className="skeleton-line" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!institution) {
    return (
      <div className="card error-card">
        <strong>Unable to load holdings.</strong>
        <span>Try refreshing the page or selecting another institution.</span>
      </div>
    );
  }

  const availableQuarters = institution.filingHistory?.length
    ? institution.filingHistory
    : [institution.quarter];

  const filtered = useMemo(() => {
    return institution.holdings
      .filter(
        (h) =>
          h.name.toLowerCase().includes(query.toLowerCase()) ||
          h.ticker.toLowerCase().includes(query.toLowerCase())
      )
      .sort((a, b) =>
        sortBy === "value" ? b.value - a.value : b.shares - a.shares
      );
  }, [institution.holdings, query, sortBy]);

  return (
    <div className="dashboard">
      {error && (
        <div className="card error-card">
          <strong>{error}</strong>
          <span>Live data failed. Showing mock results instead.</span>
        </div>
      )}
      {metrics && (
        <div className="metrics">
          <div className="card metric-card">
            <div className="metric-label">Total Value</div>
            <div className="metric-value">{metrics.totalValue}</div>
            <div className="metric-sub">Portfolio value</div>
          </div>
          <div className="card metric-card">
            <div className="metric-label">Holdings Count</div>
            <div className="metric-value">{metrics.holdingsCount}</div>
            <div className="metric-sub">Active positions</div>
          </div>
          <div className="card metric-card">
            <div className="metric-label">Top Holding</div>
            <div className="metric-value">
              {metrics.topHolding?.ticker || "—"}
            </div>
            <div className="metric-sub">
              {metrics.topHolding?.name || "No holdings"}
            </div>
          </div>
          <div className="card metric-card">
            <div className="metric-label">Quarter</div>
            <div className="metric-value">{metrics.quarter}</div>
            <div className="metric-sub">Latest filing</div>
          </div>
        </div>
      )}
      <div className="card" style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 16px" }}>
        <label htmlFor="quarter-select" style={{ fontWeight: 600 }}>
          Quarter
        </label>
        <select
          id="quarter-select"
          value={selectedQuarter || availableQuarters[0]}
          onChange={(event) => setSelectedQuarter(event.target.value)}
        >
          {availableQuarters.map((quarter) => (
            <option key={quarter} value={quarter}>
              {quarter}
            </option>
          ))}
        </select>
      </div>
      <FiltersBar onSearch={setQuery} onSort={setSortBy} />
      {filtered.length === 0 ? (
        <div className="card table-empty">
          <div style={{ fontSize: 28 }}>📊</div>
          <strong>No holdings found</strong>
          <span>Try another search term or reset filters.</span>
        </div>
      ) : (
        <HoldingsTable holdings={filtered} />
      )}
    </div>
  );
}
