import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { FilterBar } from "@/components/FilterBar";
import { SkeletonCard, SkeletonKpiCard } from "@/components/SkeletonCard";
import { cn } from "@/lib/utils";
import {
  getDateRangeBounds,
  getProjectLabel,
  normalizeProjectIds,
  type DashboardDateRange,
  type DashboardDevice,
  type DashboardFilters,
  type DashboardUserType,
} from "@/lib/dashboardFilters";
import { fetchPerformanceAnalytics } from "@/lib/analyticsApi";
import { useActiveProjectIds } from "@/hooks/useActiveProjectIds";

type StatusType = "ok" | "warning" | "critical";

function StatusBadge({ status }: { status: StatusType }) {
  if (status === "ok") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-accent rounded-full px-2.5 py-1">
        <CheckCircle2 className="h-3 w-3" /> Healthy
      </span>
    );
  }

  if (status === "warning") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-warning bg-warning/10 border border-warning/20 rounded-full px-2.5 py-1">
        <AlertTriangle className="h-3 w-3" /> Warning
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-full px-2.5 py-1">
      <XCircle className="h-3 w-3" /> Critical
    </span>
  );
}

export default function PerformancePage() {
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

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["analytics", "performance", normalizedProjectIds, start, end, filters.device, filters.userType],
    queryFn: () =>
      fetchPerformanceAnalytics({
        projectIds: normalizedProjectIds,
        start,
        end,
        device: filters.device,
        userType: filters.userType,
      }),
  });

  const metrics = data?.apiMetrics;
  const projectLabel = getProjectLabel(normalizedProjectIds);

  const healthCards = [
    {
      title: "Avg API Response",
      value: `${metrics?.avgResponseMs ?? 0}ms`,
      status: (metrics?.avgResponseMs ?? 0) < 200 ? "ok" : (metrics?.avgResponseMs ?? 0) < 500 ? "warning" : "critical",
      sub: "p50 latency",
      pct: ((metrics?.avgResponseMs ?? 0) / 1000) * 100,
    },
    {
      title: "Error Rate",
      value: `${metrics?.errorRate ?? 0}%`,
      status: (metrics?.errorRate ?? 0) < 1 ? "ok" : (metrics?.errorRate ?? 0) < 3 ? "warning" : "critical",
      sub: "of all requests",
      pct: (metrics?.errorRate ?? 0) * 10,
    },
    {
      title: "Failed Requests",
      value: (metrics?.failedRequests ?? 0).toLocaleString(),
      status: (metrics?.failedRequests ?? 0) < 500 ? "ok" : "warning",
      sub: "selected range",
      pct: ((metrics?.failedRequests ?? 0) / 2000) * 100,
    },
    {
      title: "Slow Endpoints",
      value: ((metrics?.slowEndpoints ?? []).filter((e) => e.status !== "ok").length).toString(),
      status: "warning",
      sub: "need attention",
      pct: ((metrics?.slowEndpoints ?? []).filter((e) => e.status !== "ok").length / Math.max(1, (metrics?.slowEndpoints ?? []).length)) * 100,
    },
  ] as const;

  const handleExport = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `performance-${normalizedProjectIds.replace(/[^a-z0-9,-]/gi, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <FilterBar
        title="Performance"
        subtitle={`System health from real event analytics · ${projectLabel}`}
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonKpiCard key={i} />)
          : healthCards.map((card) => (
              <div key={card.title} className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium text-muted-foreground">{card.title}</span>
                  <StatusBadge status={card.status as StatusType} />
                </div>
                <div className="text-3xl font-bold mb-3">{card.value}</div>
                <div className="h-2 rounded-full bg-muted overflow-hidden mb-2">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      card.status === "ok" && "bg-primary",
                      card.status === "warning" && "bg-warning",
                      card.status === "critical" && "bg-destructive"
                    )}
                    style={{ width: `${Math.min(100, card.pct)}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">{card.sub}</div>
              </div>
            ))}
      </div>

      {isLoading ? (
        <div className="grid lg:grid-cols-2 gap-4">
          <SkeletonCard lines={6} />
          <SkeletonCard lines={6} />
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h3 className="text-base font-semibold mb-4">API Response Time</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data?.responseTimeSeries ?? []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gRespLive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(158,64%,35%)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(158,64%,35%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <Tooltip formatter={(v: number) => [`${v}ms`, "Avg Response"]} />
                <Area type="monotone" dataKey="ms" stroke="hsl(158,64%,35%)" strokeWidth={2} fill="url(#gRespLive)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h3 className="text-base font-semibold mb-4">Error Rate</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data?.errorRateSeries ?? []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <Tooltip formatter={(v: number) => [`${v}%`, "Error Rate"]} />
                <Bar dataKey="rate" fill="hsl(0,84%,60%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {!isLoading && (
        <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-base font-semibold">Endpoint P99 Latency</h3>
          </div>
          <div className="divide-y divide-border">
            {(metrics?.slowEndpoints ?? []).map((endpoint) => (
              <div key={endpoint.path} className="flex items-center gap-4 px-6 py-4">
                <StatusBadge status={endpoint.status} />
                <span className="text-sm font-mono flex-1 truncate">{endpoint.path}</span>
                <span className="text-sm font-mono font-semibold">{endpoint.p99}ms</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
