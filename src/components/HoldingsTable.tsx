import { useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import type { Holding } from "../data/types";
import { formatNumber, formatPercent } from "../utils/format";
import { HoldingDelta } from "./HoldingDelta";

export function HoldingsTable({ holdings }: { holdings: Holding[] }) {
  const columns = useMemo<ColumnDef<Holding>[]>(() => [
    { header: "Company", accessorKey: "name" },
    { header: "Ticker", accessorKey: "ticker" },
    { header: "Shares", accessorKey: "shares", cell: info => formatNumber(info.getValue<number>()) },
    { header: "Value", accessorKey: "value", cell: info => `$${formatNumber(info.getValue<number>())}` },
    { header: "Weight", accessorKey: "weight", cell: info => formatPercent(info.getValue<number>()) },
    { header: "Δ Shares", accessorKey: "changeShares", cell: info => <HoldingDelta value={info.getValue<number>()} /> },
  ], []);

  const table = useReactTable({ data: holdings, columns, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel() });

  return (
    <div className="card p-4">
      <table width="100%">
        <thead>
          {table.getHeaderGroups().map(hg => (
            <tr key={hg.id}>
              {hg.headers.map(header => (
                <th key={header.id} style={{ textAlign: "left", padding: "10px 8px" }}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
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
