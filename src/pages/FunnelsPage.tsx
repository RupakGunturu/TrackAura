import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
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
import { fetchFunnelAnalytics } from "@/lib/analyticsApi";
import { useActiveProjectIds } from "@/hooks/useActiveProjectIds";

export default function FunnelsPage() {
  const fallbackProjectIds = import.meta.env.VITE_PROJECT_ID || "demo-project";
  const { activeProjectIds, setActiveProjectIds } = useActiveProjectIds(fallbackProjectIds);

  const [filters, setFilters] = useState<DashboardFilters>({
    dateRange: "Last 30 days",
    device: "All Devices",
    userType: "All Users",
    projectIds: activeProjectIds,
  });

  const { start, end } = getDateRangeBounds(filters.dateRange);
  const normalizedProjectIds = normalizeProjectIds(activeProjectIds || fallbackProjectIds);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["analytics", "funnels", normalizedProjectIds, start, end, filters.device, filters.userType],
    queryFn: () =>
      fetchFunnelAnalytics({
        projectIds: normalizedProjectIds,
        start,
        end,
        device: filters.device,
        userType: filters.userType,
      }),
  });

  const stages = data?.stages ?? [];
  const top = stages[0]?.value || 1;
  const projectLabel = getProjectLabel(normalizedProjectIds);

  const handleExport = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `funnels-${normalizedProjectIds.replace(/[^a-z0-9,-]/gi, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <FilterBar
        title="Conversion Funnel"
        subtitle={`Real conversion flow from stored events · ${projectLabel}`}
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

      {isLoading ? (
        <SkeletonCard lines={10} />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="text-xs text-muted-foreground">Visitors</div>
              <div className="text-2xl font-bold mt-1">{data?.totals.visitors.toLocaleString() ?? 0}</div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="text-xs text-muted-foreground">Converted</div>
              <div className="text-2xl font-bold mt-1">{data?.totals.converted.toLocaleString() ?? 0}</div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="text-xs text-muted-foreground">Conversion Rate</div>
              <div className="text-2xl font-bold mt-1">{data?.totals.conversionRate ?? 0}%</div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="text-xs text-muted-foreground">Status</div>
              <div className="text-sm font-semibold mt-2">{isFetching ? "Refreshing" : "Up to date"}</div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card shadow-card p-6 overflow-x-auto">
            <div className="flex items-center gap-2 min-w-max">
              {stages.map((stage, index) => (
                <div key={stage.name} className="flex items-center gap-2">
                  <div className="rounded-xl border border-border p-4 min-w-[150px]">
                    <div className="text-xs text-muted-foreground">{stage.name}</div>
                    <div className="text-xl font-bold mt-1">{stage.value.toLocaleString()}</div>
                    <div className="h-2 bg-muted rounded-full mt-3 overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${Math.max(0, Math.min(100, (stage.value / top) * 100))}%` }} />
                    </div>
                  </div>
                  {index < stages.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-sm font-semibold">Stage Breakdown</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-6 py-3">Stage</th>
                  <th className="text-right px-6 py-3">Users</th>
                  <th className="text-right px-6 py-3">% of Top</th>
                </tr>
              </thead>
              <tbody>
                {stages.map((stage) => (
                  <tr key={stage.name} className="border-b border-border last:border-0">
                    <td className="px-6 py-3">{stage.name}</td>
                    <td className="px-6 py-3 text-right font-semibold">{stage.value.toLocaleString()}</td>
                    <td className="px-6 py-3 text-right">{((stage.value / top) * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
