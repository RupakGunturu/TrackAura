import { useState, useEffect } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { CheckCircle2, AlertTriangle, XCircle, ArrowUpRight, Shield } from "lucide-react";
import { FilterBar } from "@/components/FilterBar";
import { SkeletonCard, SkeletonKpiCard } from "@/components/SkeletonCard";
import { apiMetrics, responseTimeSeries, errorRateSeries } from "@/lib/mockData";
import { cn } from "@/lib/utils";

type StatusType = "ok" | "warning" | "critical";

function StatusBadge({ status }: { status: StatusType }) {
  if (status === "ok") return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-accent rounded-full px-2.5 py-1">
      <CheckCircle2 className="h-3 w-3" /> Healthy
    </span>
  );
  if (status === "warning") return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-warning bg-warning/10 border border-warning/20 rounded-full px-2.5 py-1">
      <AlertTriangle className="h-3 w-3" /> Warning
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-full px-2.5 py-1">
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
    { title: "Avg API Response", value: `${apiMetrics.avgResponseMs}ms`, status: apiMetrics.avgResponseMs < 200 ? "ok" : apiMetrics.avgResponseMs < 500 ? "warning" : "critical", sub: "p50 latency", pct: (apiMetrics.avgResponseMs / 1000) * 100 },
    { title: "Error Rate", value: `${apiMetrics.errorRate}%`, status: apiMetrics.errorRate < 1 ? "ok" : apiMetrics.errorRate < 3 ? "warning" : "critical", sub: "of all requests", pct: apiMetrics.errorRate * 10 },
    { title: "Failed Requests", value: apiMetrics.failedRequests.toLocaleString(), status: apiMetrics.failedRequests < 500 ? "ok" : "warning", sub: "last 24 hours", pct: (apiMetrics.failedRequests / 2000) * 100 },
    { title: "Slow Endpoints", value: apiMetrics.slowEndpoints.filter(e => e.status !== "ok").length.toString(), status: "warning" as StatusType, sub: "need attention", pct: (apiMetrics.slowEndpoints.filter(e => e.status !== "ok").length / apiMetrics.slowEndpoints.length) * 100 },
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
                className={cn("animate-fade-in-up group rounded-2xl border border-border bg-card p-5 shadow-card hover:shadow-elevated hover:border-primary/20 transition-all duration-300", `stagger-${i + 1}`)}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium text-muted-foreground tracking-wide">{card.title}</span>
                  <StatusBadge status={card.status as StatusType} />
                </div>
                <div className="text-3xl font-bold text-foreground tracking-tight mb-3">{card.value}</div>
                <div className="h-2 rounded-full bg-muted overflow-hidden mb-2">
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
          <div className="animate-fade-in-up stagger-3 rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-semibold text-foreground">API Response Time</h3>
                <p className="text-xs text-muted-foreground mt-0.5">24h avg latency (ms)</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-primary font-medium cursor-pointer hover:underline">
                Details <ArrowUpRight className="h-3 w-3" />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={responseTimeSeries} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gResp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(158,64%,35%)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(158,64%,35%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12, boxShadow: "var(--shadow-elevated)" }}
                  formatter={(v: number) => [`${v}ms`, "Avg Response"]}
                />
                <Area type="monotone" dataKey="ms" stroke="hsl(158,64%,35%)" strokeWidth={2} fill="url(#gResp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="animate-fade-in-up stagger-4 rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-semibold text-foreground">Error Rate</h3>
                <p className="text-xs text-muted-foreground mt-0.5">24h error % (target &lt; 1%)</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={errorRateSeries} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12, boxShadow: "var(--shadow-elevated)" }}
                  formatter={(v: number) => [`${v}%`, "Error Rate"]}
                />
                <Bar dataKey="rate" fill="hsl(0,84%,60%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Slow endpoints */}
      {!loading && (
        <div className="animate-fade-in-up stagger-5 rounded-2xl border border-border bg-card shadow-card overflow-hidden">
          <div className="px-6 py-5 border-b border-border flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <div>
              <h3 className="text-base font-semibold text-foreground">Endpoint P99 Latency</h3>
              <p className="text-xs text-muted-foreground">Slowest endpoints by 99th percentile response time</p>
            </div>
          </div>
          <div className="divide-y divide-border">
            {apiMetrics.slowEndpoints.map((ep) => (
              <div key={ep.path} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/20 transition-colors">
                <StatusBadge status={ep.status as StatusType} />
                <span className="text-sm font-mono text-foreground flex-1 truncate">{ep.path}</span>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-28 h-2 rounded-full bg-muted overflow-hidden">
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
                      "text-sm font-mono font-bold w-16 text-right",
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
