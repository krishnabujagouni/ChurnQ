"use client";

import { useState } from "react";
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

function StatusPill({ status }: { status: string }) {
  const c = STATUS_COLORS[status] ?? { bg: "bg-slate-100", text: "text-slate-600" };
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
      {label}
    </span>
  );
}

type StatusFilter = "all" | "pending" | "exhausted";

const columns: ColumnDef<RecoveryRow>[] = [
  {
    accessorKey: "customerEmail",
    meta: { headerTitle: "Customer", skeleton: <Skeleton className="h-4 w-40" /> },
    header: ({ column }) => <DataGridColumnHeader column={column} title="Customer" />,
    cell: ({ row }) => {
      const email = row.original.customerEmail;
      const id    = row.original.customerId;
      return (
        <div className="flex flex-col gap-0.5">
          {email
            ? <span className="text-sm font-medium text-foreground">{email}</span>
            : <span className="text-sm text-muted-foreground italic">No email</span>}
          {id && <span className="text-xs text-muted-foreground">{id}</span>}
        </div>
      );
    },
    size: 220,
  },
  {
    accessorKey: "failureClass",
    meta: { headerTitle: "Failure Type", skeleton: <Skeleton className="h-4 w-32" /> },
    header: ({ column }) => <DataGridColumnHeader column={column} title="Failure Type" />,
    cell: ({ getValue }) => {
      const v = getValue() as string;
      return <span className="text-sm text-foreground">{FAILURE_LABELS[v] ?? v}</span>;
    },
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
      return (
        <span className="text-sm">
          {attempts} / {maxAttempts}
        </span>
      );
    },
    size: 100,
  },
  {
    accessorKey: "nextRetryAt",
    meta: { headerTitle: "Next Retry", skeleton: <Skeleton className="h-4 w-28" /> },
    header: ({ column }) => <DataGridColumnHeader column={column} title="Next Retry" />,
    cell: ({ row }) => {
      const { nextRetryAt, status } = row.original;
      if (status === "exhausted" || !nextRetryAt) {
        return <span className="text-sm text-muted-foreground">—</span>;
      }
      const d = new Date(nextRetryAt);
      const now = new Date();
      const diffMs = d.getTime() - now.getTime();
      const diffH = Math.round(diffMs / 3_600_000);
      const label =
        diffH <= 0
          ? "Soon"
          : diffH < 24
          ? `in ${diffH}h`
          : `in ${Math.round(diffH / 24)}d`;
      return (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm">{label}</span>
          <span className="text-xs text-muted-foreground">
            {d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
          </span>
        </div>
      );
    },
    size: 120,
  },
  {
    accessorKey: "lastError",
    meta: { headerTitle: "Last Error", skeleton: <Skeleton className="h-4 w-32" /> },
    header: ({ column }) => <DataGridColumnHeader column={column} title="Last Error" />,
    cell: ({ getValue }) => {
      const v = getValue() as string | null;
      if (!v) return <span className="text-muted-foreground text-sm">—</span>;
      return (
        <span className="text-xs text-muted-foreground truncate max-w-[200px] block" title={v}>
          {v}
        </span>
      );
    },
    size: 200,
  },
  {
    accessorKey: "createdAt",
    meta: { headerTitle: "Failed At", skeleton: <Skeleton className="h-4 w-24" /> },
    header: ({ column }) => <DataGridColumnHeader column={column} title="Failed At" />,
    cell: ({ getValue }) => {
      const v = getValue() as string;
      return (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
        </span>
      );
    },
    size: 120,
  },
];

export function RecoveryTable({ rows }: { rows: RecoveryRow[] }) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [filter, setFilter] = useState<StatusFilter>("all");

  const filtered = filter === "all" ? rows : rows.filter((r) => r.status === filter);

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

  const filterBtn = (val: StatusFilter, label: string) => (
    <button
      type="button"
      onClick={() => setFilter(val)}
      style={{
        fontSize: 12,
        fontWeight: 500,
        padding: "4px 12px",
        borderRadius: 6,
        border: "1px solid var(--cs-border, #e4e4e7)",
        cursor: "pointer",
        background: filter === val ? "var(--cs-accent, #18181b)" : "transparent",
        color: filter === val ? "#fff" : "var(--cs-text-muted, #71717a)",
        transition: "background 0.15s, color 0.15s",
      }}
    >
      {label}
    </button>
  );

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {filterBtn("all", "All")}
        {filterBtn("pending", "Active")}
        {filterBtn("exhausted", "Exhausted")}
      </div>

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
