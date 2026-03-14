import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { Globe, FileText } from "lucide-react";
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
import { fetchRealtimeAnalytics } from "@/lib/analyticsApi";
import { useActiveProjectIds } from "@/hooks/useActiveProjectIds";

export default function RealTimePage() {
  const fallbackProjectIds = import.meta.env.VITE_PROJECT_ID || "demo-project";
  const { activeProjectIds, setActiveProjectIds } = useActiveProjectIds(fallbackProjectIds);

  const [filters, setFilters] = useState<DashboardFilters>({
    dateRange: "Last 30 days",
    device: "All Devices",
    userType: "All Users",
    projectIds: activeProjectIds,
  });
  const normalizedProjectIds = normalizeProjectIds(activeProjectIds || fallbackProjectIds);

  const { start, end } = getDateRangeBounds(filters.dateRange);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["analytics", "realtime", normalizedProjectIds, start, end, filters.device, filters.userType],
    queryFn: () =>
      fetchRealtimeAnalytics({
        projectIds: normalizedProjectIds,
        start,
        end,
        device: filters.device,
        userType: filters.userType,
      }),
    refetchInterval: 5000,
  });

  const projectLabel = getProjectLabel(normalizedProjectIds);

  const handleExport = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `realtime-${normalizedProjectIds.replace(/[^a-z0-9,-]/gi, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <FilterBar
        title="Real-Time"
        subtitle={`Live user activity from database · ${projectLabel}`}
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
        <SkeletonCard lines={8} />
      ) : (
        <>
          <div className="rounded-2xl border border-border bg-card shadow-card p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs text-muted-foreground">Users online right now</div>
                <div className="text-5xl font-bold tracking-tight mt-1">{data?.onlineUsers?.toLocaleString() ?? 0}</div>
                <div className="text-xs text-muted-foreground mt-2">
                  Trend: {data?.trend ?? "stable"} · Updated {data ? new Date(data.lastUpdated).toLocaleTimeString() : "-"}
                </div>
              </div>
              <span className="text-xs text-primary font-medium">{isFetching ? "Refreshing..." : "Live"}</span>
            </div>
            <div className="mt-5">
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={data?.data ?? []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gRealtimeLive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(158,64%,35%)" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="hsl(158,64%,35%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 2" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="t" hide />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(v: number) => [v.toLocaleString(), "Active sessions"]} />
                  <Area type="monotone" dataKey="v" stroke="hsl(158,64%,35%)" strokeWidth={2} fill="url(#gRealtimeLive)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="h-4 w-4 text-primary" />
                <h3 className="text-base font-semibold">Users by Region</h3>
              </div>
              <div className="space-y-3">
                {(data?.regions ?? []).map((region) => (
                  <div key={region.name}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>{region.name}</span>
                      <span className="font-semibold">{region.users.toLocaleString()}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary/70" style={{ width: `${region.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-4 w-4 text-primary" />
                <h3 className="text-base font-semibold">Active Pages</h3>
              </div>
              <div className="space-y-2">
                {(data?.pages ?? []).map((page) => (
                  <div key={page.path} className="flex items-center justify-between text-sm">
                    <span className="font-mono truncate">{page.path}</span>
                    <span className="font-semibold">{page.events.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
