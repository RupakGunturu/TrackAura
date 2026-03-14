import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { FilterBar } from "@/components/FilterBar";
import { SkeletonCard } from "@/components/SkeletonCard";
import {
  getDateRangeBounds,
  getProjectLabel,
  normalizeProjectIds,
  type DashboardDateRange,
  type DashboardDevice,
  type DashboardFilters,
  type DashboardUserType,
} from "@/lib/dashboardFilters";
import { fetchRetentionAnalytics } from "@/lib/analyticsApi";
import { useActiveProjectIds } from "@/hooks/useActiveProjectIds";

function getCellBg(value: number | null): string {
  if (value === null) return "transparent";
  if (value >= 90) return "hsl(158, 64%, 35%)";
  if (value >= 75) return "hsl(158, 58%, 42%)";
  if (value >= 60) return "hsl(158, 52%, 50%)";
  if (value >= 45) return "hsl(158, 46%, 58%)";
  if (value >= 30) return "hsl(158, 40%, 66%)";
  if (value >= 15) return "hsl(158, 34%, 76%)";
  return "hsl(158, 28%, 88%)";
}

function getCellText(value: number | null): string {
  if (value === null) return "";
  return value >= 55 ? "hsl(0, 0%, 100%)" : "hsl(220, 20%, 10%)";
}

export default function RetentionPage() {
  const fallbackProjectIds = "";
  const { activeProjectIds, setActiveProjectIds } = useActiveProjectIds(fallbackProjectIds);

  const [filters, setFilters] = useState<DashboardFilters>({
    dateRange: "Last 30 days",
    device: "All Devices",
    userType: "All Users",
    projectIds: activeProjectIds,
  });

  const { start, end } = useMemo(() => getDateRangeBounds(filters.dateRange), [filters.dateRange]);
  const normalizedProjectIds = normalizeProjectIds(activeProjectIds || fallbackProjectIds);
  const hasProjectSelection = normalizedProjectIds.length > 0;

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ["analytics", "retention", normalizedProjectIds, start, end, filters.device, filters.userType],
    queryFn: () =>
      fetchRetentionAnalytics({
        projectIds: normalizedProjectIds,
        start,
        end,
        device: filters.device,
        userType: filters.userType,
      }),
    enabled: hasProjectSelection,
    retry: 1,
  });

  const curveData = useMemo(() => {
    const columns = data?.cohortColumns ?? [];
    const rows = data?.cohortData ?? [];
    return columns.map((label, index) => {
      const values = rows.map((r) => r.retention[index]).filter((v): v is number => v !== null);
      const avg = values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
      return { period: label, retention: avg };
    });
  }, [data]);

  const projectLabel = getProjectLabel(normalizedProjectIds);

  const handleExport = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `retention-${normalizedProjectIds.replace(/[^a-z0-9,-]/gi, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <FilterBar
        title="Retention"
        subtitle={`Cohort retention from stored events · ${projectLabel}`}
        dateRange={filters.dateRange}
        device={filters.device}
        userType={filters.userType}
        projectIds={activeProjectIds}
        onDateRangeChange={(value: DashboardDateRange) => setFilters((prev) => ({ ...prev, dateRange: value }))}
        onDeviceChange={(value: DashboardDevice) => setFilters((prev) => ({ ...prev, device: value }))}
        onUserTypeChange={(value: DashboardUserType) => setFilters((prev) => ({ ...prev, userType: value }))}
        onProjectIdsChange={setActiveProjectIds}
        onRefresh={() => refetch()}
        onExport={handleExport}
      />

      {!hasProjectSelection && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6">
          <h3 className="text-base font-semibold text-gray-900">No project selected</h3>
          <p className="mt-2 text-sm text-gray-600">Select an integrated project to show retention blocks. Until then this section stays empty.</p>
        </div>
      )}

      {hasProjectSelection && isPending && !data ? (
        <SkeletonCard lines={9} />
      ) : hasProjectSelection && isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          <div className="text-sm font-semibold">Unable to load retention analytics</div>
          <div className="mt-1 text-xs">{error instanceof Error ? error.message : "Request failed"}</div>
          <button
            onClick={() => refetch()}
            className="mt-4 rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      ) : hasProjectSelection ? (
        <>
          <div className="rounded-2xl border border-border bg-card shadow-card p-6">
            <h3 className="text-base font-semibold mb-4">Average Retention Curve</h3>
            <ResponsiveContainer width="100%" height={190}>
              <AreaChart data={curveData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="retGradLive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(158, 64%, 35%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(158, 64%, 35%)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" vertical={false} />
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: "hsl(220, 10%, 50%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(220, 10%, 50%)" }} axisLine={false} tickLine={false} unit="%" domain={[0, 100]} />
                <Tooltip formatter={(value: number) => [`${value}%`, "Retention"]} />
                <Area type="monotone" dataKey="retention" stroke="hsl(158, 64%, 35%)" strokeWidth={2.5} fill="url(#retGradLive)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl border border-border bg-card shadow-card overflow-x-auto">
            {(data?.cohortData ?? []).length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground">No cohort data available for the selected filters.</div>
            ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-6 py-3">Cohort</th>
                  <th className="text-right px-6 py-3">Users</th>
                  {(data?.cohortColumns ?? []).map((col) => (
                    <th key={col} className="text-center px-3 py-3">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(data?.cohortData ?? []).map((row) => (
                  <tr key={row.cohort} className="border-b border-border last:border-0">
                    <td className="px-6 py-3 font-medium">{row.cohort}</td>
                    <td className="px-6 py-3 text-right">{row.users.toLocaleString()}</td>
                    {row.retention.map((val, index) => (
                      <td key={index} className="px-2 py-2">
                        {val === null ? (
                          <div className="h-9 rounded bg-muted/20 flex items-center justify-center text-xs text-muted-foreground">—</div>
                        ) : (
                          <div className="h-9 rounded flex items-center justify-center text-sm font-semibold" style={{ backgroundColor: getCellBg(val), color: getCellText(val) }}>
                            {val}%
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
