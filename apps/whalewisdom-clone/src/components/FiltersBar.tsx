import { useState } from "react";

export function FiltersBar({ onSearch }: { onSearch: (value: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <div className="card p-4" style={{ display: "flex", gap: 12 }}>
      <input
        placeholder="Search by name or ticker"
        value={value}
        onChange={(e) => { setValue(e.target.value); onSearch(e.target.value); }}
        style={{ flex: 1, padding: "10px 12px", borderRadius: 10, border: "1px solid #e3d6c7" }}
      />
    </div>
  );
}
