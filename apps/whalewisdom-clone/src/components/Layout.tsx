export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ fontSize: 26 }}>WhalewisdomClone</h1>
        <nav style={{ display: "flex", gap: 16, fontSize: 14, opacity: 0.7 }}>
          <a href="/">Dashboard</a>
        </nav>
      </header>
      {children}
    </main>
  );
}
