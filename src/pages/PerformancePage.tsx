import { useState, useEffect } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { FilterBar } from "@/components/FilterBar";
import { SkeletonCard, SkeletonKpiCard } from "@/components/SkeletonCard";
import { apiMetrics, responseTimeSeries, errorRateSeries } from "@/lib/mockData";
import { cn } from "@/lib/utils";

type StatusType = "ok" | "warning" | "critical";

function StatusBadge({ status }: { status: StatusType }) {
  if (status === "ok") return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary bg-accent rounded-full px-2 py-0.5">
      <CheckCircle2 className="h-3 w-3" /> OK
    </span>
  );
  if (status === "warning") return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-warning bg-warning/10 border border-warning/20 rounded-full px-2 py-0.5">
      <AlertTriangle className="h-3 w-3" /> Slow
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-full px-2 py-0.5">
      <XCircle className="h-3 w-3" /> Critical
    </span>
  );
}

export default function PerformancePage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const healthCards = [
    {
      title: "Avg API Response",
      value: `${apiMetrics.avgResponseMs}ms`,
      status: apiMetrics.avgResponseMs < 200 ? "ok" : apiMetrics.avgResponseMs < 500 ? "warning" : "critical",
      sub: "p50 latency",
      pct: (apiMetrics.avgResponseMs / 1000) * 100,
    },
    {
      title: "Error Rate",
      value: `${apiMetrics.errorRate}%`,
      status: apiMetrics.errorRate < 1 ? "ok" : apiMetrics.errorRate < 3 ? "warning" : "critical",
      sub: "of all requests",
      pct: apiMetrics.errorRate * 10,
    },
    {
      title: "Failed Requests",
      value: apiMetrics.failedRequests.toLocaleString(),
      status: apiMetrics.failedRequests < 500 ? "ok" : "warning",
      sub: "last 24 hours",
      pct: (apiMetrics.failedRequests / 2000) * 100,
    },
    {
      title: "Slow Endpoints",
      value: apiMetrics.slowEndpoints.filter((e) => e.status !== "ok").length.toString(),
      status: "warning" as StatusType,
      sub: "need attention",
      pct: (apiMetrics.slowEndpoints.filter((e) => e.status !== "ok").length / apiMetrics.slowEndpoints.length) * 100,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up stagger-1">
        <FilterBar title="Performance" subtitle="System health and API monitoring" />
      </div>

      {/* Health cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonKpiCard key={i} />)
          : healthCards.map((card, i) => (
              <div
                key={card.title}
                className={cn("animate-fade-in-up rounded-xl border border-border bg-card p-5 shadow-card", `stagger-${i + 1}`)}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{card.title}</span>
                  <StatusBadge status={card.status as StatusType} />
                </div>
                <div className="text-2xl font-bold text-foreground tracking-tight mb-3">{card.value}</div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-1.5">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700",
                      card.status === "ok" && "bg-primary",
                      card.status === "warning" && "bg-warning",
                      card.status === "critical" && "bg-destructive",
                    )}
                    style={{ width: `${Math.min(100, card.pct)}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">{card.sub}</div>
              </div>
            ))}
      </div>

      {/* Charts */}
      {loading ? (
        <div className="grid lg:grid-cols-2 gap-4">
          <SkeletonCard lines={6} />
          <SkeletonCard lines={6} />
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Response time */}
          <div className="animate-fade-in-up stagger-3 rounded-xl border border-border bg-card p-5 shadow-card">
            <h3 className="text-sm font-semibold text-foreground mb-1">API Response Time</h3>
            <p className="text-xs text-muted-foreground mb-4">24h avg latency (ms)</p>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={responseTimeSeries} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gResp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(158,64%,35%)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="hsl(158,64%,35%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [`${v}ms`, "Avg Response"]}
                />
                <Area type="monotone" dataKey="ms" stroke="hsl(158,64%,35%)" strokeWidth={2} fill="url(#gResp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Error rate */}
          <div className="animate-fade-in-up stagger-4 rounded-xl border border-border bg-card p-5 shadow-card">
            <h3 className="text-sm font-semibold text-foreground mb-1">Error Rate</h3>
            <p className="text-xs text-muted-foreground mb-4">24h error % (target &lt; 1%)</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={errorRateSeries} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [`${v}%`, "Error Rate"]}
                />
                <Bar dataKey="rate" fill="hsl(0,84%,60%)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Slow endpoints */}
      {!loading && (
        <div className="animate-fade-in-up stagger-5 rounded-xl border border-border bg-card shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Endpoint P99 Latency</h3>
            <p className="text-xs text-muted-foreground">Slowest endpoints by 99th percentile response time</p>
          </div>
          <div className="divide-y divide-border">
            {apiMetrics.slowEndpoints.map((ep) => (
              <div key={ep.path} className="flex items-center gap-4 px-5 py-3 hover:bg-muted/30 transition-colors">
                <StatusBadge status={ep.status as StatusType} />
                <span className="text-xs font-mono text-foreground flex-1 truncate">{ep.path}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        ep.status === "ok" && "bg-primary",
                        ep.status === "warning" && "bg-warning",
                        ep.status === "critical" && "bg-destructive",
                      )}
                      style={{ width: `${Math.min(100, (ep.p99 / 3000) * 100)}%` }}
                    />
                  </div>
                  <span
                    className={cn(
                      "text-xs font-mono font-semibold w-16 text-right",
                      ep.status === "ok" && "text-primary",
                      ep.status === "warning" && "text-warning",
                      ep.status === "critical" && "text-destructive",
                    )}
                  >
                    {ep.p99}ms
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
