import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useHoldingsStore } from "../store/useHoldingsStore";
import { formatNumber, formatPercent } from "../utils/format";
import type { Holding } from "../data/types";

type TabKey = "all" | "new" | "exited" | "increased" | "decreased";

type CategorizedHolding = Holding & {
  category: Exclude<TabKey, "all">;
};

const TAB_LABELS: Record<TabKey, string> = {
  all: "All Holdings",
  new: "🟢 New Positions",
  exited: "🔴 Exited Positions",
  increased: "⬆ Increased",
  decreased: "⬇ Decreased",
};

const TAB_ORDER: TabKey[] = ["all", "new", "exited", "increased", "decreased"];

export default function Filing() {
  const { institution, loadReal, loading: isLoading } = useHoldingsStore();
  const { accession } = useParams();
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  // Auto-load default institution if navigated directly with empty store
  useEffect(() => {
    if (!institution && !isLoading) {
      loadReal("0001067983");
    }
  }, [institution, isLoading, loadReal]);

  const holdings = institution?.holdings ?? [];

  const categorizedHoldings = useMemo<CategorizedHolding[]>(() => {
    if (!holdings.length) return [];
    return holdings.map((holding) => {
      if (holding.changeShares > 0 && holding.changeShares === holding.shares) {
        return { ...holding, category: "new" };
      }
      if (holding.shares === 0 || (holding.changeShares < 0 && holding.shares < 100)) {
        return { ...holding, category: "exited" };
      }
      if (holding.changeShares > 0) {
        return { ...holding, category: "increased" };
      }
      return { ...holding, category: "decreased" };
    });
  }, [holdings]);

  const tabCounts = useMemo(() => {
    const counts = {
      all: categorizedHoldings.length,
      new: 0,
      exited: 0,
      increased: 0,
      decreased: 0,
    } as Record<TabKey, number>;
    categorizedHoldings.forEach((holding) => {
      counts[holding.category] += 1;
    });
    return counts;
  }, [categorizedHoldings]);

  const filteredHoldings = useMemo(() => {
    if (activeTab === "all") return categorizedHoldings;
    return categorizedHoldings.filter((holding) => holding.category === activeTab);
  }, [activeTab, categorizedHoldings]);

  if (!institution) {
    return (
      <div className="card error-card" style={{ textAlign: "center", padding: "3rem" }}>
        <span style={{ fontSize: "1.5rem" }}>⏳</span>
        <strong style={{ display: "block", marginTop: "0.5rem" }}>
          {isLoading ? "Loading filing data…" : "No filing loaded — go to Dashboard first"}
        </strong>
        {!isLoading && (
          <Link to="/" style={{ marginTop: "0.75rem", display: "inline-block", color: "var(--color-accent)" }}>
            ← Back to Dashboard
          </Link>
        )}
      </div>
    );
  }

  if (!institution.holdings) {
    return <div>No holdings data</div>;
  }

  const totalValue = `$${formatNumber(institution.totalValue)}`;
  const filingQuarter = institution.quarter || "Latest";
  const accessionValue = accession ?? "0001067983-24-000020";

  return (
    <div className="dashboard dashboard-narrow">
      <div className="card p-6" style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link className="nav-link" to="/" style={{ padding: 0 }}>
            ←
          </Link>
          <div style={{ fontSize: 20, fontWeight: 600 }}>
            {institution.name} — {filingQuarter} 13F Filing
          </div>
        </div>
        <div style={{ color: "var(--color-text-muted)", fontSize: 14 }}>
          Accession: {accessionValue} &nbsp; | &nbsp; Filed: 2024-02-14 &nbsp; | &nbsp;
          Total Value: {totalValue}
        </div>
      </div>

      <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        <div className="card p-4" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {TAB_ORDER.map((tab) => {
            const isActive = tab === activeTab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                style={{
                  borderRadius: 999,
                  border: "1px solid var(--color-border)",
                  background: isActive ? "rgba(59,130,246,0.18)" : "transparent",
                  color: isActive ? "var(--color-text)" : "var(--color-text-muted)",
                  padding: "8px 14px",
                  fontSize: 13,
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  whiteSpace: "nowrap",
                }}
              >
                {TAB_LABELS[tab]}
                <span
                  style={{
                    background: isActive
                      ? "rgba(59,130,246,0.25)"
                      : "rgba(59,130,246,0.12)",
                    padding: "2px 8px",
                    borderRadius: 999,
                    fontSize: 12,
                    color: "var(--color-text)",
                  }}
                >
                  {tabCounts[tab]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="card table-card">
        <div className="table-wrapper">
          <table className="holdings-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Ticker</th>
                <th className="table-right">Shares</th>
                <th className="table-right">Δ Shares</th>
                <th className="table-right">Value</th>
                <th className="table-right">Weight</th>
                <th className="table-right">Change%</th>
              </tr>
            </thead>
            <AnimatePresence mode="wait">
              <motion.tbody
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {filteredHoldings.map((holding) => {
                  const previousShares = holding.shares - holding.changeShares;
                  const changePercent =
                    previousShares > 0
                      ? formatPercent(holding.changeShares / previousShares)
                      : "—";
                  const tint =
                    holding.category === "new"
                      ? "rgba(34,197,94,0.12)"
                      : holding.category === "exited"
                      ? "rgba(239,68,68,0.12)"
                      : holding.category === "increased"
                      ? "rgba(34,197,94,0.08)"
                      : "rgba(239,68,68,0.08)";

                  return (
                    <tr key={holding.cusip} style={{ background: tint }}>
                      <td>{holding.name}</td>
                      <td className="table-mono">{holding.ticker}</td>
                      <td className="table-right table-mono">
                        {formatNumber(holding.shares)}
                      </td>
                      <td className="table-right table-mono">
                        {holding.changeShares >= 0 ? "+" : ""}
                        {formatNumber(holding.changeShares)}
                      </td>
                      <td className="table-right table-mono">
                        ${formatNumber(holding.value)}
                      </td>
                      <td className="table-right table-mono">
                        {formatPercent(holding.weight)}
                      </td>
                      <td className="table-right table-mono">{changePercent}</td>
                    </tr>
                  );
                })}
              </motion.tbody>
            </AnimatePresence>
          </table>
        </div>
      </div>
    </div>
  );
}
