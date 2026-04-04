import { useState } from "react";

export function FiltersBar({
  onSearch,
  onSort,
}: {
  onSearch: (value: string) => void;
  onSort: (value: "value" | "shares") => void;
}) {
  const [value, setValue] = useState("");
  const [sortBy, setSortBy] = useState<"value" | "shares">("value");

  return (
    <div className="card p-4" style={{ display: "flex", gap: 12 }}>
      <input
        placeholder="Search by name or ticker"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onSearch(e.target.value);
        }}
        style={{ flex: 1, padding: "10px 12px", borderRadius: 10, border: "1px solid #e3d6c7" }}
      />
      <select
        value={sortBy}
        onChange={(e) => {
          const v = e.target.value as "value" | "shares";
          setSortBy(v);
          onSort(v);
        }}
        style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #e3d6c7" }}
      >
        <option value="value">Sort by Value</option>
        <option value="shares">Sort by Shares</option>
      </select>
    </div>
  );
}
