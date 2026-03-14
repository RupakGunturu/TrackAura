import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, Users, Activity, Clock, MousePointerClick } from "lucide-react";
import { FilterBar } from "@/components/FilterBar";
import { SkeletonKpiCard, SkeletonCard } from "@/components/SkeletonCard";
import {
  getDateRangeBounds,
  getProjectLabel,
  normalizeProjectIds,
  type DashboardDateRange,
  type DashboardDevice,
  type DashboardFilters,
  type DashboardUserType,
} from "@/lib/dashboardFilters";
import { fetchOverviewAnalytics } from "@/lib/analyticsApi";
import { useActiveProjectIds } from "@/hooks/useActiveProjectIds";
import { cn } from "@/lib/utils";

const COLORS = ["hsl(158,64%,35%)", "hsl(152,76%,55%)", "hsl(38,92%,50%)"];
const icons = [Users, Activity, MousePointerClick, Clock];

export default function OverviewPage() {
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
    queryKey: ["analytics", "overview", normalizedProjectIds, start, end, filters.device, filters.userType],
    queryFn: () =>
      fetchOverviewAnalytics({
        projectIds: normalizedProjectIds,
        start,
        end,
        device: filters.device,
        userType: filters.userType,
      }),
  });

  const projectLabel = getProjectLabel(normalizedProjectIds);

  return (
    <div className="space-y-6">
      <FilterBar
        title="Overview"
        subtitle={`Executive summary from live stored analytics · ${projectLabel}`}
        dateRange={filters.dateRange}
        device={filters.device}
        userType={filters.userType}
        projectIds={activeProjectIds}
        onDateRangeChange={(value: DashboardDateRange) => setFilters((prev) => ({ ...prev, dateRange: value }))}
        onDeviceChange={(value: DashboardDevice) => setFilters((prev) => ({ ...prev, device: value }))}
        onUserTypeChange={(value: DashboardUserType) => setFilters((prev) => ({ ...prev, userType: value }))}
        onProjectIdsChange={setActiveProjectIds}
        onRefresh={async () => {
          await refetch();
        }}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonKpiCard key={i} />)
          : (data?.kpiCards ?? []).map((card, i) => {
              const Icon = icons[i] ?? Users;
              const sparkData = card.trendSeries.map((v, j) => ({ v, j }));

              return (
                <div key={card.title} className="rounded-2xl border border-border bg-card p-5 shadow-card">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-muted-foreground">{card.title}</span>
                    <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div className="text-2xl font-semibold text-foreground">{card.value}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full",
                        card.positive ? "text-primary bg-accent" : "text-destructive bg-destructive/10"
                      )}
                    >
                      {card.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {card.change}
                    </span>
                    <span className="text-[11px] text-muted-foreground">{card.sub}</span>
                  </div>
                  <div className="mt-3 h-12">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={sparkData}>
                        <Area
                          type="monotone"
                          dataKey="v"
                          stroke={card.positive ? "hsl(158,64%,35%)" : "hsl(0,84%,60%)"}
                          strokeWidth={2}
                          fill="hsl(158 64% 35% / 0.12)"
                          dot={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            })}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {isLoading ? (
          <>
            <SkeletonCard className="lg:col-span-2" lines={7} />
            <SkeletonCard lines={7} />
          </>
        ) : (
          <>
            <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-card">
              <h3 className="text-base font-semibold text-foreground mb-4">Daily Active Users</h3>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={data?.dauSeries ?? []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gOverviewUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(158,64%,35%)" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="hsl(158,64%,35%)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(v: number, key: string) => [v.toLocaleString(), key === "users" ? "Users" : "Sessions"]} />
                  <Area type="monotone" dataKey="users" stroke="hsl(158,64%,35%)" strokeWidth={2.5} fill="url(#gOverviewUsers)" />
                  <Area type="monotone" dataKey="sessions" stroke="hsl(152,76%,55%)" strokeWidth={2} fill="hsl(152 76% 55% / 0.06)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <h3 className="text-sm font-semibold text-foreground mb-1">Traffic by Device</h3>
                <p className="text-xs text-muted-foreground mb-3">Live distribution of tracked events</p>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie data={data?.deviceData ?? []} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={5} dataKey="value" strokeWidth={0}>
                      {(data?.deviceData ?? []).map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => [`${v}%`, "Share"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <h3 className="text-sm font-semibold text-foreground">Conversion Rate</h3>
                <div className="text-3xl font-semibold text-primary mt-2">{data?.conversionSummary.rate ?? 0}%</div>
                <div className="flex items-center gap-1 mt-2 text-xs">
                  {(data?.conversionSummary.delta ?? 0) >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-primary" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-destructive" />
                  )}
                  <span className={(data?.conversionSummary.delta ?? 0) >= 0 ? "text-primary" : "text-destructive"}>
                    {(data?.conversionSummary.delta ?? 0) >= 0 ? "+" : ""}
                    {data?.conversionSummary.delta ?? 0}%
                  </span>
                  <span className="text-muted-foreground">vs baseline 10%</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {!isLoading && (
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h3 className="text-base font-semibold text-foreground mb-4">Hourly Traffic</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data?.hourlyTraffic ?? []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={2} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <Tooltip formatter={(v: number) => [v.toLocaleString(), "Users"]} />
                <Bar dataKey="users" radius={[4, 4, 0, 0]} fill="hsl(158,64%,35%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h3 className="text-base font-semibold text-foreground mb-4">Top Pages</h3>
            <div className="space-y-3">
              {(data?.topPages ?? []).map((page, i) => {
                const top = data?.topPages?.[0]?.views ?? 1;
                const pct = Math.round((page.views / top) * 100);

                return (
                  <div key={page.path}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-mono text-foreground truncate">{i + 1}. {page.path}</span>
                      <span className="text-sm font-semibold">{page.views.toLocaleString()}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="mt-1 text-[11px] text-muted-foreground">Bounce {page.bounce}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
