import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
} from "@tanstack/react-table";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { AnimatePresence, motion } from "framer-motion";
import type { Holding } from "../data/types";
import { formatNumber, formatPercent } from "../utils/format";
import { HoldingDelta } from "./HoldingDelta";

export function HoldingsTable({ holdings }: { holdings: Holding[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<Holding>[]>(
    () => [
      { header: "Company", accessorKey: "name", enableSorting: true },
      { header: "Ticker", accessorKey: "ticker", enableSorting: true },
      {
        header: "Shares",
        accessorKey: "shares",
        enableSorting: true,
        cell: (info) => formatNumber(info.getValue<number>()),
      },
      {
        header: "Value",
        accessorKey: "value",
        enableSorting: true,
        cell: (info) => `$${formatNumber(info.getValue<number>())}`,
      },
      {
        header: "Weight",
        accessorKey: "weight",
        enableSorting: true,
        cell: (info) => {
          const weight = info.getValue<number>();
          return (
            <span style={{ fontWeight: weight > 0.1 ? 600 : 500 }}>
              {formatPercent(weight)}
            </span>
          );
        },
      },
      {
        header: "Δ Shares",
        accessorKey: "changeShares",
        enableSorting: true,
        cell: (info) => <HoldingDelta value={info.getValue<number>()} />,
      },
    ],
    []
  );

  const table = useReactTable({
    data: holdings,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const numericColumns = new Set(["shares", "value", "weight", "changeShares"]);

  return (
    <div className="card table-card">
      <div className="table-wrapper">
        <table className="holdings-table">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => {
                  const sorted = header.column.getIsSorted();
                  const sortIndicator =
                    sorted === "asc" ? "▲" : sorted === "desc" ? "▼" : "";
                  return (
                    <th
                      key={header.id}
                      onClick={
                        header.column.getCanSort()
                          ? () => header.column.toggleSorting()
                          : undefined
                      }
                      style={{
                        cursor: header.column.getCanSort() ? "pointer" : "default",
                      }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {sortIndicator && (
                        <span style={{ marginLeft: 6 }}>{sortIndicator}</span>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {table.getRowModel().rows.map((row) => (
                <motion.tr
                  key={row.id}
                  className="holdings-row"
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {row.getVisibleCells().map((cell) => {
                    const columnId = cell.column.id;
                    const isNumeric = numericColumns.has(columnId);
                    return (
                      <td
                        key={cell.id}
                        className={`${isNumeric ? "table-mono table-right" : ""}`}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    );
                  })}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
