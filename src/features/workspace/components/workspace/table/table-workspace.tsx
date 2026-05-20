"use client";

import React, { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Search,
  Table2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

import type { JsonValue } from "../core/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SortDir = "asc" | "desc" | null;
type SortState = { col: string; dir: SortDir };

type FlatRow = Record<string, JsonValue>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Flatten an array-of-objects one level deep for table display */
function flattenRows(value: JsonValue): FlatRow[] | null {
  if (!Array.isArray(value)) return null;
  const objects = value.filter(
    (item): item is Record<string, JsonValue> =>
      item !== null && typeof item === "object" && !Array.isArray(item),
  );
  if (objects.length === 0) return null;
  return objects;
}

/** Collect all unique column keys across rows (preserves insertion order) */
function collectColumns(rows: FlatRow[]): string[] {
  const seen = new Set<string>();
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      seen.add(key);
    }
  }
  return Array.from(seen);
}

/** Render a cell value as a short string */
function cellText(value: JsonValue): string {
  if (value === null) return "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "object") return Array.isArray(value) ? `[${value.length}]` : "{…}";
  return String(value);
}

/** Compare two cell values for sorting */
function compareValues(a: JsonValue, b: JsonValue, dir: "asc" | "desc"): number {
  const av = a === null || a === undefined ? "" : typeof a === "object" ? JSON.stringify(a) : a;
  const bv = b === null || b === undefined ? "" : typeof b === "object" ? JSON.stringify(b) : b;
  const result =
    typeof av === "number" && typeof bv === "number"
      ? av - bv
      : String(av).localeCompare(String(bv), undefined, { numeric: true });
  return dir === "asc" ? result : -result;
}

const PAGE_SIZES = [10, 25, 50, 100];

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function TableWorkspace({
  parsedValue,
  onCopy,
  onDownload,
}: {
  parsedValue: JsonValue | null;
  onCopy: (value: string, message?: string) => Promise<void>;
  onDownload: (content: string, filename: string) => void;
}) {
  const rows = useMemo(() => (parsedValue ? flattenRows(parsedValue) : null), [parsedValue]);
  const columns = useMemo(() => (rows ? collectColumns(rows) : []), [rows]);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortState>({ col: "", dir: null });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [hiddenCols, setHiddenCols] = useState<Set<string>>(new Set());
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  const visibleCols = useMemo(
    () => columns.filter((col) => !hiddenCols.has(col)),
    [columns, hiddenCols],
  );

  // Filter rows by global search
  const filteredRows = useMemo(() => {
    if (!rows) return [];
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      Object.values(row).some((v) => cellText(v).toLowerCase().includes(q)),
    );
  }, [rows, search]);

  // Sort
  const sortedRows = useMemo(() => {
    if (!sort.col || !sort.dir) return filteredRows;
    return [...filteredRows].sort((a, b) =>
      compareValues(a[sort.col] ?? null, b[sort.col] ?? null, sort.dir!),
    );
  }, [filteredRows, sort]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, page, pageSize]);

  function toggleSort(col: string) {
    setPage(1);
    setSort((current) => {
      if (current.col !== col) return { col, dir: "asc" };
      if (current.dir === "asc") return { col, dir: "desc" };
      return { col: "", dir: null };
    });
  }

  function toggleHideCol(col: string) {
    setHiddenCols((current) => {
      const next = new Set(current);
      if (next.has(col)) next.delete(col);
      else next.add(col);
      return next;
    });
  }

  function exportCsv() {
    if (!rows || rows.length === 0) return;
    const header = visibleCols.join(",");
    const csvRows = sortedRows.map((row) =>
      visibleCols
        .map((col) => {
          const val = cellText(row[col] ?? null);
          return val.includes(",") || val.includes('"') || val.includes("\n")
            ? `"${val.replace(/"/g, '""')}"`
            : val;
        })
        .join(","),
    );
    onDownload([header, ...csvRows].join("\n"), "jsonova-table.csv");
  }

  function copyRowJson(row: FlatRow) {
    void onCopy(JSON.stringify(row, null, 2), "Copied row as JSON");
  }

  // Error states
  if (!parsedValue) {
    return <TableEmpty message="Paste valid JSON in the Editor to explore it as a table." />;
  }

  if (!Array.isArray(parsedValue)) {
    return (
      <TableEmpty message="Table view requires an array of objects. Your JSON is not an array." />
    );
  }

  if (!rows || rows.length === 0) {
    return (
      <TableEmpty message="This array contains no plain objects. Table view works best with arrays of objects." />
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#0A0C0F]">
      {/* ------------------------------------------------------------------ Toolbar */}
      <div className="flex shrink-0 flex-wrap items-center gap-3 border-b-[0.5px] border-ui-border bg-[#0F1117] px-4 py-3 sm:px-5">
        {/* Search */}
        <div className="flex h-9 min-w-[200px] flex-1 items-center gap-2 rounded-md border-[0.5px] border-ui-border bg-[#0A0C0F] px-3">
          <Search className="size-3.5 shrink-0 text-[#3A4060]" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Filter rows..."
            className="w-full bg-transparent font-mono text-[12px] text-[#E8EAF0] outline-none placeholder:text-[#3A4060]"
          />
          {search ? (
            <button type="button" onClick={() => setSearch("")} className="text-[#5A6070] hover:text-[#E8EAF0]">
              <X className="size-3" />
            </button>
          ) : null}
        </div>

        {/* Stats badge */}
        <span className="shrink-0 rounded-full border-[0.5px] border-[#C07040]/30 bg-[#1F140C] px-3 py-1 text-[11px] font-medium text-[#C07040]">
          {filteredRows.length.toLocaleString()} / {rows.length.toLocaleString()} rows · {visibleCols.length} cols
        </span>

        {/* Export CSV */}
        <button
          type="button"
          onClick={exportCsv}
          className="flex h-9 items-center gap-1.5 rounded-md border-[0.5px] border-ui-border bg-[#1A1D24] px-3 text-[11px] font-medium text-[#8B92A8] transition-colors hover:border-[#C07040]/40 hover:text-[#E8EAF0] focus-visible:outline-none"
        >
          <Download className="size-3.5" />
          Export CSV
        </button>

        {/* Copy JSON */}
        <button
          type="button"
          onClick={() => void onCopy(JSON.stringify(sortedRows, null, 2), "Copied filtered rows as JSON")}
          className="flex h-9 items-center gap-1.5 rounded-md border-[0.5px] border-ui-border bg-[#1A1D24] px-3 text-[11px] font-medium text-[#8B92A8] transition-colors hover:border-[#C07040]/40 hover:text-[#E8EAF0] focus-visible:outline-none"
        >
          <Copy className="size-3.5" />
          Copy JSON
        </button>
      </div>

      {/* ------------------------------------------------------------------ Column visibility */}
      {columns.length > 0 ? (
        <div className="flex shrink-0 items-center gap-2 overflow-x-auto border-b-[0.5px] border-ui-border bg-[#0A0C0F] px-4 py-2 sm:px-5">
          <span className="shrink-0 text-[10px] font-medium uppercase tracking-[0.06em] text-[#3A4060]">
            Columns
          </span>
          <div className="flex gap-1.5">
            {columns.map((col) => (
              <button
                key={col}
                type="button"
                onClick={() => toggleHideCol(col)}
                className={cn(
                  "shrink-0 rounded-full border-[0.5px] px-2.5 py-0.5 text-[10px] font-medium transition-colors",
                  hiddenCols.has(col)
                    ? "border-[#2A2F42] bg-transparent text-[#3A4060] line-through"
                    : "border-[#C07040]/30 bg-[#1F140C] text-[#C07040]",
                )}
              >
                {col}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {/* ------------------------------------------------------------------ Table */}
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full min-w-max border-collapse text-[12px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#0F1117]">
              {/* Row # */}
              <th className="w-12 border-b-[0.5px] border-r-[0.5px] border-ui-border px-3 py-2.5 text-left font-mono text-[10px] text-[#3A4060]">
                #
              </th>
              {visibleCols.map((col) => {
                const isSorted = sort.col === col;
                return (
                  <th
                    key={col}
                    className="border-b-[0.5px] border-r-[0.5px] border-ui-border px-3 py-2.5 text-left"
                  >
                    <button
                      type="button"
                      onClick={() => toggleSort(col)}
                      className="flex items-center gap-1.5 font-mono text-[11px] font-semibold transition-colors hover:text-[#C07040] focus-visible:outline-none"
                      style={{ color: isSorted ? "#C07040" : "#8B92A8" }}
                    >
                      {col}
                      {isSorted && sort.dir === "asc" ? (
                        <ArrowUp className="size-3" />
                      ) : isSorted && sort.dir === "desc" ? (
                        <ArrowDown className="size-3" />
                      ) : (
                        <ArrowUpDown className="size-3 opacity-30" />
                      )}
                    </button>
                  </th>
                );
              })}
              {/* Actions col */}
              <th className="w-10 border-b-[0.5px] border-ui-border px-2 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {pagedRows.map((row, rowIndex) => {
              const absoluteIndex = (page - 1) * pageSize + rowIndex;
              const isSelected = selectedRow === absoluteIndex;
              return (
                <tr
                  key={rowIndex}
                  onClick={() => setSelectedRow(isSelected ? null : absoluteIndex)}
                  className={cn(
                    "cursor-pointer border-b-[0.5px] border-ui-border transition-colors",
                    isSelected
                      ? "bg-[#1F140C]"
                      : rowIndex % 2 === 0
                      ? "bg-[#0A0C0F] hover:bg-[#0F1117]"
                      : "bg-[#0D0F14] hover:bg-[#0F1117]",
                  )}
                >
                  {/* Row number */}
                  <td className="border-r-[0.5px] border-ui-border px-3 py-2 font-mono text-[10px] text-[#3A4060]">
                    {absoluteIndex + 1}
                  </td>

                  {visibleCols.map((col) => {
                    const val = row[col] ?? null;
                    const text = cellText(val);
                    const isComplex = val !== null && typeof val === "object";
                    const isNull = val === null;
                    const isBool = typeof val === "boolean";
                    const isNum = typeof val === "number";

                    return (
                      <td
                        key={col}
                        className="max-w-[260px] border-r-[0.5px] border-ui-border px-3 py-2"
                        title={isComplex ? JSON.stringify(val, null, 2) : text}
                      >
                        <span
                          className={cn(
                            "block truncate font-mono text-[12px]",
                            isNull
                              ? "text-[#5A6070]"
                              : isBool
                              ? "text-[#79C0FF]"
                              : isNum
                              ? "text-[#3DD68C]"
                              : isComplex
                              ? "italic text-[#8B92A8]"
                              : "text-[#E8EAF0]",
                          )}
                        >
                          {text}
                        </span>
                      </td>
                    );
                  })}

                  {/* Row action */}
                  <td className="px-2 py-2 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyRowJson(row);
                      }}
                      title="Copy row as JSON"
                      className="rounded p-1 text-[#3A4060] transition-colors hover:bg-[#1A1D24] hover:text-[#C07040] focus-visible:outline-none"
                    >
                      <Copy className="size-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredRows.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-[13px] text-[#3A4060]">
            No rows match the current filter.
          </div>
        ) : null}
      </div>

      {/* ------------------------------------------------------------------ Selected row detail */}
      {selectedRow !== null && sortedRows[selectedRow] ? (
        <RowDetailPanel
          row={sortedRows[selectedRow]}
          rowIndex={selectedRow}
          onClose={() => setSelectedRow(null)}
          onCopy={onCopy}
        />
      ) : null}

      {/* ------------------------------------------------------------------ Pagination */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t-[0.5px] border-ui-border bg-[#0F1117] px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#5A6070]">Rows per page</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="h-7 rounded-md border-[0.5px] border-ui-border bg-[#0A0C0F] px-2 text-[11px] text-[#8B92A8] outline-none focus-visible:border-[#C07040]"
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#5A6070]">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="flex h-7 w-7 items-center justify-center rounded-md border-[0.5px] border-ui-border bg-[#0A0C0F] text-[#8B92A8] transition-colors hover:border-[#C07040]/40 hover:text-[#E8EAF0] disabled:opacity-30 focus-visible:outline-none"
          >
            <ChevronLeft className="size-3.5" />
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="flex h-7 w-7 items-center justify-center rounded-md border-[0.5px] border-ui-border bg-[#0A0C0F] text-[#8B92A8] transition-colors hover:border-[#C07040]/40 hover:text-[#E8EAF0] disabled:opacity-30 focus-visible:outline-none"
          >
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Row detail side panel
// ---------------------------------------------------------------------------

function RowDetailPanel({
  row,
  rowIndex,
  onClose,
  onCopy,
}: {
  row: FlatRow;
  rowIndex: number;
  onClose: () => void;
  onCopy: (value: string, message?: string) => Promise<void>;
}) {
  return (
    <div className="shrink-0 border-t-[0.5px] border-[#C07040]/30 bg-[#0F1117]">
      <div className="flex items-center justify-between border-b-[0.5px] border-ui-border px-4 py-2.5">
        <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#C07040]">
          Row {rowIndex + 1} — Detail
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void onCopy(JSON.stringify(row, null, 2), "Copied row as JSON")}
            className="flex items-center gap-1 rounded-md border-[0.5px] border-ui-border bg-[#1A1D24] px-2 py-1 text-[10px] font-medium text-[#8B92A8] transition-colors hover:text-[#E8EAF0]"
          >
            <Copy className="size-3" /> Copy JSON
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-[#5A6070] transition-colors hover:text-[#E8EAF0] focus-visible:outline-none"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>
      <div className="grid max-h-40 grid-cols-2 gap-x-4 gap-y-1 overflow-y-auto px-4 py-3 sm:grid-cols-3 lg:grid-cols-4">
        {Object.entries(row).map(([key, val]) => (
          <div key={key} className="min-w-0">
            <p className="truncate text-[10px] font-medium text-[#5A6070]">{key}</p>
            <p
              className={cn(
                "truncate font-mono text-[11px]",
                val === null
                  ? "text-[#5A6070]"
                  : typeof val === "boolean"
                  ? "text-[#79C0FF]"
                  : typeof val === "number"
                  ? "text-[#3DD68C]"
                  : typeof val === "object"
                  ? "italic text-[#8B92A8]"
                  : "text-[#E8EAF0]",
              )}
              title={typeof val === "object" ? JSON.stringify(val, null, 2) : cellText(val)}
            >
              {cellText(val)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty states
// ---------------------------------------------------------------------------

function TableEmpty({ message }: { message: string }) {
  return (
    <div className="flex h-full items-center justify-center bg-[#0A0C0F] p-8">
      <div className="flex max-w-[320px] flex-col items-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-[12px] bg-[#1A1D24]">
          <Table2 className="size-7 text-[#5A6070]" />
        </div>
        <p className="text-[14px] font-medium text-[#5A6070]">{message}</p>
      </div>
    </div>
  );
}
