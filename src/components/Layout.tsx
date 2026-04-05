import { useHoldingsStore } from "../store/useHoldingsStore";

export function Layout({ children }: { children: React.ReactNode }) {
  const { institution } = useHoldingsStore();

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <div className="brand-title">
            {institution?.name ?? "WhaleSquare Capital"}
          </div>
          <span className="quarter-badge">{institution?.quarter ?? "Q4 2024"}</span>
        </div>
        <nav className="nav-links">
          <a className="nav-link" href="/">Dashboard</a>
          <a className="nav-link" href="/institutions">Institutions</a>
          <a className="nav-link" href="/filings">Filings</a>
        </nav>
        <button className="nav-toggle" type="button" aria-label="Open navigation">
          ☰
        </button>
      </header>
      <main className="app-main">{children}</main>
    </div>
  );
}
