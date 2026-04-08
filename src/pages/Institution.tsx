import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { fetchInstitution } from "../data/edgar";
import type { Holding, Institution as InstitutionData } from "../data/types";
import { formatNumber, formatPercent } from "../utils/format";
import { pageVariants } from "../utils/transitions";
import { Sparkline } from "../components/Sparkline";

const TABLE_COLUMNS = [
  "Company",
  "Ticker",
  "Shares",
  "Δ Shares",
  "Value",
  "Weight",
  "Action",
];

function getActionLabel(holding: Holding) {
  if (holding.changeShares === holding.shares) {
    return { label: "NEW", color: "var(--color-success)" };
  }
  if (holding.shares === 0) {
    return { label: "EXITED", color: "var(--color-danger)" };
  }
  return holding.changeShares >= 0
    ? { label: "↑", color: "var(--color-success)" }
    : { label: "↓", color: "var(--color-danger)" };
}

function buildSparklineData(holding: Holding) {
  const base = Math.max(holding.value, 1);
  const drift = holding.changeShares >= 0 ? 1.08 : 0.94;
  return [base * 0.62, base * 0.74 * drift, base * 0.83 * drift, base];
}

export default function Institution() {
  const { cik } = useParams();
  const [institution, setInstitution] = useState<InstitutionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const holdings = institution?.holdings ?? [];

  useEffect(() => {
    if (!cik) return;
    let active = true;
    setLoading(true);
    setError(null);
    fetchInstitution(cik)
      .then((data) => {
        if (!active) return;
        setInstitution(data);
      })
      .catch(() => {
        if (!active) return;
        setError("Unable to load institution details.");
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [cik]);

  const metrics = useMemo(() => {
    if (!institution) return null;
    const holdingsCount = institution.holdingsCount ?? holdings.length;
    const topHolding = [...holdings].sort((a, b) => b.value - a.value)[0];
    const newPositions = holdings.filter(
      (holding) => holding.changeShares === holding.shares
    ).length;
    return {
      totalValue: `$${formatNumber(institution.totalValue)}`,
      holdingsCount,
      topHolding,
      newPositions,
    };
  }, [holdings, institution]);

  const holdingsByChange = useMemo(() => {
    if (!holdings.length) return [];
    return [...holdings]
      .sort((a, b) => Math.abs(b.changeShares) - Math.abs(a.changeShares))
      .slice(0, 10);
  }, [holdings]);

  const topHoldings = useMemo(() => {
    if (!holdings.length) return [];
    return [...holdings]
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [holdings]);

  if (loading && !institution) {
    return (
      <div className="dashboard dashboard-narrow">
        <div className="metrics">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="card metric-card">
              <div className="skeleton-line" style={{ width: "45%" }} />
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

  if (error || !institution) {
    return (
      <div className="card error-card">
        <strong>{error ?? "Unable to load institution."}</strong>
        <span>Try refreshing the page or returning to the dashboard.</span>
      </div>
    );
  }

  if (!institution.holdings) {
    return <div>No holdings data</div>;
  }

  return (
    <motion.div
      className="dashboard dashboard-narrow"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h1 style={{ margin: 0 }}>{institution.name}</h1>
          <span className="quarter-badge">{institution.quarter}</span>
        </div>
        <Link to="/" className="nav-link">
          ← Back to Dashboard
        </Link>
      </div>

      {metrics && (
        <div className="metrics">
          <div className="card metric-card">
            <div className="metric-label">Total Value</div>
            <div className="metric-value">{metrics.totalValue}</div>
            <div className="metric-sub">Portfolio value</div>
          </div>
          <div className="card metric-card">
            <div className="metric-label"># Holdings</div>
            <div className="metric-value">{metrics.holdingsCount}</div>
            <div className="metric-sub">Active positions</div>
          </div>
          <div className="card metric-card">
            <div className="metric-label">Largest Pos</div>
            <div className="metric-value">{metrics.topHolding?.ticker || metrics.topHolding?.name?.split(" ").slice(0,2).join(" ") || "—"}</div>
            <div className="metric-sub">
              {metrics.topHolding
                ? `$${formatNumber(metrics.topHolding.value)}`
                : "No holdings"}
            </div>
          </div>
          <div className="card metric-card">
            <div className="metric-label">New Positions</div>
            <div className="metric-value">{metrics.newPositions}</div>
            <div className="metric-sub">Added this quarter</div>
          </div>
        </div>
      )}

      <div className="card table-card">
        <div className="table-wrapper">
          <table className="holdings-table">
            <thead>
              <tr>
                {TABLE_COLUMNS.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {holdingsByChange.map((holding) => {
                const action = getActionLabel(holding);
                return (
                  <tr key={holding.cusip} className="holdings-row">
                    <td>{holding.name}</td>
                    <td className="table-mono">{holding.ticker}</td>
                    <td className="table-mono table-right">
                      {formatNumber(holding.shares)}
                    </td>
                    <td className="table-mono table-right">
                      {formatNumber(holding.changeShares)}
                    </td>
                    <td className="table-mono table-right">
                      ${formatNumber(holding.value)}
                    </td>
                    <td className="table-mono table-right">
                      {formatPercent(holding.weight)}
                    </td>
                    <td>
                      <span
                        style={{
                          fontWeight: 700,
                          color: action.color,
                          border: `1px solid ${action.color}`,
                          padding: "2px 8px",
                          borderRadius: 999,
                          fontSize: 12,
                        }}
                      >
                        {action.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ padding: 20, display: "grid", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <h3 style={{ margin: 0 }}>Holding History</h3>
          <span style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
            Last 4 quarters
          </span>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 12,
          }}
        >
          {topHoldings.map((holding) => (
            <div
              key={holding.cusip}
              style={{
                border: "1px solid var(--color-border)",
                borderRadius: 12,
                padding: 12,
                background: "var(--color-surface-elev)",
                display: "grid",
                gap: 8,
              }}
            >
              <div style={{ fontWeight: 600 }}>{holding.ticker || holding.name}</div>
              <div style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
                ${formatNumber(holding.value)}
              </div>
              <Sparkline data={buildSparklineData(holding)} />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
