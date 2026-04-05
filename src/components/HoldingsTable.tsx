import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
} from "@tanstack/react-table";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import type { Holding } from "../data/types";
import { formatNumber, formatPercent } from "../utils/format";
import { HoldingDelta } from "./HoldingDelta";

export function HoldingsTable({ holdings }: { holdings: Holding[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<Holding>[]>(() => [
    { header: "Company", accessorKey: "name", enableSorting: true },
    { header: "Ticker", accessorKey: "ticker", enableSorting: true },
    { header: "Shares", accessorKey: "shares", enableSorting: true, cell: info => formatNumber(info.getValue<number>()) },
    { header: "Value", accessorKey: "value", enableSorting: true, cell: info => `$${formatNumber(info.getValue<number>())}` },
    { header: "Weight", accessorKey: "weight", enableSorting: true, cell: info => formatPercent(info.getValue<number>()) },
    { header: "Δ Shares", accessorKey: "changeShares", enableSorting: true, cell: info => <HoldingDelta value={info.getValue<number>()} /> },
  ], []);

  const table = useReactTable({
    data: holdings,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="card p-4">
      <table width="100%">
        <thead>
          {table.getHeaderGroups().map(hg => (
            <tr key={hg.id}>
              {hg.headers.map(header => {
                const sorted = header.column.getIsSorted();
                const sortIndicator = sorted === "asc" ? "▲" : sorted === "desc" ? "▼" : "";
                return (
                  <th
                    key={header.id}
                    style={{ textAlign: "left", padding: "10px 8px", cursor: header.column.getCanSort() ? "pointer" : "default" }}
                    onClick={header.column.getCanSort() ? () => header.column.toggleSorting() : undefined}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {sortIndicator && <span style={{ marginLeft: 6 }}>{sortIndicator}</span>}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} style={{ padding: "10px 8px", borderTop: "1px solid #efe6d8" }}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
