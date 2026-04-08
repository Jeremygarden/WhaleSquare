import { Link } from "react-router-dom";
import { useHoldingsStore } from "../store/useHoldingsStore";

export function Layout({ children }: { children: React.ReactNode }) {
  const { institution } = useHoldingsStore();

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <Link to="/" className="brand-title" style={{ textDecoration: "none", color: "inherit" }}>
            {institution?.name ?? "WhaleSquare Capital"}
          </Link>
          <span className="quarter-badge">{institution?.quarter ?? "—"}</span>
        </div>
        <nav className="nav-links">
          <Link className="nav-link" to="/">Dashboard</Link>
          <Link className="nav-link" to={institution ? `/institution/${institution.cik}` : "/institution/0001067983"}>Institutions</Link>
          <Link className="nav-link" to={institution ? `/filing/${institution.cik}` : "/filing/0001067983"}>Filings</Link>
        </nav>
        <button className="nav-toggle" type="button" aria-label="Open navigation">
          ☰
        </button>
      </header>
      <main className="app-main">{children}</main>
    </div>
  );
}
