"use client";

import { useMemo, useState } from "react";
import {
  useReactTable, getCoreRowModel, getSortedRowModel, getPaginationRowModel,
  type ColumnDef, type SortingState,
} from "@tanstack/react-table";
import {
  DataGrid, DataGridContainer, DataGridTable,
  DataGridColumnHeader,
} from "@/components/ui/data-grid-table";
import SlidingPagination from "@/components/ui/sliding-pagination";
import { Skeleton } from "@/components/ui/skeleton";

export type RecoveryRow = {
  id: string;
  customerEmail: string | null;
  customerId: string | null;
  failureClass: string;
  attempts: number;
  maxAttempts: number;
  status: string;
  nextRetryAt: string | null;
  lastError: string | null;
  createdAt: string;
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending:    { bg: "bg-amber-100",  text: "text-amber-800" },
  processing: { bg: "bg-blue-100",   text: "text-blue-800" },
  exhausted:  { bg: "bg-red-100",    text: "text-red-700" },
};

const FAILURE_LABELS: Record<string, string> = {
  insufficient_funds:    "Insufficient funds",
  card_declined:         "Card declined",
  expired_card:          "Expired card",
  authentication_or_cvc: "Auth / CVC error",
  invalid_account:       "Invalid account",
  try_again_later:       "Try again later",
  unknown:               "Unknown",
  other:                 "Other",
};

const FAILURE_TYPES = ["All", "insufficient_funds", "card_declined", "expired_card", "authentication_or_cvc", "invalid_account", "try_again_later"] as const;

function StatusPill({ status }: { status: string }) {
  const c = STATUS_COLORS[status] ?? { bg: "bg-slate-100", text: "text-slate-600" };
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
      {label}
    </span>
  );
}

const columns: ColumnDef<RecoveryRow>[] = [
  {
    accessorKey: "customerEmail",
    meta: { headerTitle: "Customer", skeleton: <Skeleton className="h-4 w-40" /> },
    header: ({ column }) => <DataGridColumnHeader column={column} title="Customer" />,
    cell: ({ row }) => {
      const email = row.original.customerEmail;
      return (
        <span className="text-sm font-medium text-foreground">
          {email ?? <span className="italic text-muted-foreground">No email</span>}
        </span>
      );
    },
    size: 220,
  },
  {
    accessorKey: "failureClass",
    meta: { headerTitle: "Failure Type", skeleton: <Skeleton className="h-4 w-32" /> },
    header: ({ column }) => <DataGridColumnHeader column={column} title="Failure Type" />,
    cell: ({ getValue }) => (
      <span className="text-sm text-foreground">{FAILURE_LABELS[getValue() as string] ?? (getValue() as string)}</span>
    ),
    size: 160,
  },
  {
    accessorKey: "status",
    meta: { headerTitle: "Status", skeleton: <Skeleton className="h-5 w-20 rounded-full" /> },
    header: ({ column }) => <DataGridColumnHeader column={column} title="Status" />,
    cell: ({ getValue }) => <StatusPill status={getValue() as string} />,
    size: 120,
  },
  {
    id: "progress",
    accessorFn: (row) => row.attempts,
    meta: { headerTitle: "Retries", skeleton: <Skeleton className="h-4 w-16" /> },
    header: ({ column }) => <DataGridColumnHeader column={column} title="Retries" />,
    cell: ({ row }) => {
      const { attempts, maxAttempts } = row.original;
      if (maxAttempts === 0) {
        return <span className="text-sm text-muted-foreground">Email only</span>;
      }
      return <span className="text-sm">{attempts} / {maxAttempts}</span>;
    },
    size: 90,
  },
  {
    accessorKey: "nextRetryAt",
    meta: { headerTitle: "Next Retry", skeleton: <Skeleton className="h-4 w-28" /> },
    header: ({ column }) => <DataGridColumnHeader column={column} title="Next Retry" />,
    cell: ({ row }) => {
      const { nextRetryAt, status } = row.original;
      if (status === "exhausted" || !nextRetryAt) {
        return <span className="text-sm text-muted-foreground"></span>;
      }
      const d = new Date(nextRetryAt);
      const diffH = Math.round((d.getTime() - Date.now()) / 3_600_000);
      const label = diffH <= 0 ? "Soon" : diffH < 24 ? `in ${diffH}h` : `in ${Math.round(diffH / 24)}d`;
      return (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm">{label}</span>
          <span className="text-xs text-muted-foreground">
            {d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
          </span>
        </div>
      );
    },
    size: 110,
  },
  {
    accessorKey: "lastError",
    meta: { headerTitle: "Last Error", skeleton: <Skeleton className="h-4 w-32" /> },
    header: ({ column }) => <DataGridColumnHeader column={column} title="Last Error" />,
    cell: ({ getValue }) => {
      const v = getValue() as string | null;
      if (!v) return <span className="text-muted-foreground text-sm"></span>;
      return (
        <span className="text-xs text-muted-foreground truncate max-w-[200px] block" title={v}>{v}</span>
      );
    },
    size: 200,
  },
  {
    accessorKey: "createdAt",
    meta: { headerTitle: "Failed At", skeleton: <Skeleton className="h-4 w-24" /> },
    header: ({ column }) => <DataGridColumnHeader column={column} title="Failed At" />,
    cell: ({ getValue }) => (
      <span className="text-sm text-muted-foreground whitespace-nowrap">
        {new Date(getValue() as string).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
      </span>
    ),
    size: 120,
  },
];

export function RecoveryTable({ rows }: { rows: RecoveryRow[] }) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "exhausted">("all");
  const [failureFilter, setFailureFilter] = useState<(typeof FAILURE_TYPES)[number]>("All");

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (statusFilter === "pending" && r.status !== "pending") return false;
      if (statusFilter === "exhausted" && r.status !== "exhausted") return false;
      if (failureFilter !== "All" && r.failureClass !== failureFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (
          !(r.customerEmail ?? "").toLowerCase().includes(q) &&
          !(r.customerId ?? "").toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [rows, statusFilter, failureFilter, search]);

  const filtersActive = search.trim() !== "" || statusFilter !== "all" || failureFilter !== "All";

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 15 } },
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center bg-white border border-border rounded-lg p-3">
        <input
          type="text"
          placeholder="Search email or customer ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[180px] h-8 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <div className="flex gap-1.5">
          {(["all", "pending", "exhausted"] as const).map((s) => (
            <button key={s} type="button" onClick={() => setStatusFilter(s)}
              className={`px-3 h-8 rounded-md text-xs font-medium border transition-colors ${statusFilter === s ? "bg-foreground text-background border-foreground" : "bg-background text-muted-foreground border-input hover:bg-muted"}`}>
              {s === "all" ? "All" : s === "pending" ? "Active" : "Exhausted"}
            </button>
          ))}
        </div>
        <select value={failureFilter} onChange={(e) => setFailureFilter(e.target.value as typeof failureFilter)}
          className="h-8 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
          {FAILURE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t === "All" ? "All failure types" : FAILURE_LABELS[t] ?? t}
            </option>
          ))}
        </select>
        {filtersActive && (
          <button type="button" onClick={() => { setSearch(""); setStatusFilter("all"); setFailureFilter("All"); }}
            className="h-8 px-3 rounded-md border border-input bg-background text-muted-foreground text-xs hover:bg-muted">
            Clear
          </button>
        )}
      </div>

      {/* Data Grid */}
      <DataGrid table={table} recordCount={filtered.length} tableLayout={{ headerSticky: true }}>
        <DataGridContainer>
          <div className="overflow-x-auto">
            <DataGridTable />
          </div>
          <div className="border-t border-border px-4 py-3 flex justify-center">
            <SlidingPagination
              totalPages={table.getPageCount()}
              currentPage={table.getState().pagination.pageIndex + 1}
              onPageChange={(p) => table.setPageIndex(p - 1)}
            />
          </div>
        </DataGridContainer>
      </DataGrid>
    </div>
  );
}
