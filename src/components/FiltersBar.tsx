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
    <div className="card p-4 filters-bar">
      <div className="search-field">
        <span className="search-icon">🔍</span>
        <input
          className="filters-input"
          placeholder="Search by name or ticker"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            onSearch(e.target.value);
          }}
        />
      </div>
      <select
        className="filters-select"
        value={sortBy}
        onChange={(e) => {
          const v = e.target.value as "value" | "shares";
          setSortBy(v);
          onSort(v);
        }}
      >
        <option value="value">Sort by Value</option>
        <option value="shares">Sort by Shares</option>
      </select>
    </div>
  );
}
