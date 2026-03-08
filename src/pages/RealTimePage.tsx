import { useState, useEffect, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { FilterBar } from "@/components/FilterBar";
import { generateRealtimeData } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { Globe, Monitor, FileText, ArrowUpRight } from "lucide-react";

export default function RealTimePage() {
  const [data, setData] = useState(() => generateRealtimeData(60));
  const [count, setCount] = useState(2847);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [trend, setTrend] = useState<"up" | "down" | "stable">("stable");
  const prevCount = useRef(count);

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => {
        const last = prev[prev.length - 1];
        const newVal = Math.max(
          2400,
          Math.min(3600, last.v + Math.round((Math.random() - 0.48) * 80))
        );
        const next = [...prev.slice(1), { t: last.t + 1, v: newVal }];
        setCount(newVal);
        setLastUpdated(new Date());
        setTrend(newVal > prevCount.current ? "up" : newVal < prevCount.current ? "down" : "stable");
        prevCount.current = newVal;
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const regions = [
    { name: "North America", pct: 38, users: Math.round(count * 0.38), flag: "🇺🇸" },
    { name: "Europe", pct: 27, users: Math.round(count * 0.27), flag: "🇪🇺" },
    { name: "Asia-Pacific", pct: 22, users: Math.round(count * 0.22), flag: "🌏" },
    { name: "Rest of World", pct: 13, users: Math.round(count * 0.13), flag: "🌍" },
  ];

  const pages = [
    { path: "/dashboard", pct: 31 },
    { path: "/onboarding", pct: 18 },
    { path: "/reports", pct: 14 },
    { path: "/profile", pct: 12 },
    { path: "/settings", pct: 9 },
  ];

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up stagger-1">
        <FilterBar title="Real-Time" subtitle="Live user activity — updates every 2 seconds" />
      </div>

      {/* Hero counter */}
      <div className="animate-fade-in-up stagger-2 rounded-2xl border border-border bg-card shadow-elevated overflow-hidden">
        <div className="relative bg-gradient-to-br from-accent via-primary/5 to-transparent p-8 sm:p-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex items-center gap-5">
              {/* Pulsing dot */}
              <div className="relative">
                <div className="h-6 w-6 rounded-full bg-primary opacity-20 absolute inset-0 animate-ping" />
                <div className="h-6 w-6 rounded-full bg-primary relative z-10 flex items-center justify-center shadow-lg">
                  <div className="h-3 w-3 rounded-full bg-primary-foreground" />
                </div>
              </div>
              <div>
                <div
                  className={cn(
                    "text-6xl font-bold tracking-tighter tabular-nums transition-all duration-500",
                    trend === "up" && "text-primary",
                    trend === "down" && "text-destructive",
                    trend === "stable" && "text-foreground"
                  )}
                >
                  {count.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground mt-1 font-medium">users online right now</div>
              </div>
            </div>
            <div className="sm:ml-auto text-left sm:text-right space-y-1">
              <div className={cn(
                "inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full",
                trend === "up" && "text-primary bg-accent",
                trend === "down" && "text-destructive bg-destructive/10",
                trend === "stable" && "text-muted-foreground bg-muted"
              )}>
                {trend === "up" ? "↑ Increasing" : trend === "down" ? "↓ Decreasing" : "→ Stable"}
              </div>
              <div className="text-xs text-muted-foreground">
                Last updated: <span className="font-mono text-foreground">{lastUpdated.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sparkline */}
        <div className="px-6 pb-6 pt-2">
          <p className="text-xs text-muted-foreground mb-3 font-medium">Last 60 readings · 2s interval</p>
          <ResponsiveContainer width="100%" height={130}>
            <AreaChart data={data} margin={{ top: 4, right: 4, left: -30, bottom: 0 }}>
              <defs>
                <linearGradient id="gRealtime" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(158,64%,35%)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(158,64%,35%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 2" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="t" hide />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} domain={["auto", "auto"]} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12, boxShadow: "var(--shadow-elevated)" }}
                labelFormatter={() => "Users"}
                formatter={(v: number) => [v.toLocaleString(), "Online"]}
              />
              <Area
                type="monotone"
                dataKey="v"
                stroke="hsl(158,64%,35%)"
                strokeWidth={2}
                fill="url(#gRealtime)"
                dot={false}
                activeDot={{ r: 4, fill: "hsl(158,64%,35%)" }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Regional breakdown + Active pages */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="animate-fade-in-up stagger-3 rounded-2xl border border-border bg-card p-6 shadow-card hover:shadow-elevated transition-shadow">
          <div className="flex items-center gap-2 mb-5">
            <Globe className="h-4 w-4 text-primary" />
            <h3 className="text-base font-semibold text-foreground">Users by Region</h3>
          </div>
          <div className="space-y-4">
            {regions.map((r) => (
              <div key={r.name}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="flex items-center gap-2">
                    <span>{r.flag}</span>
                    <span className="text-foreground font-medium">{r.name}</span>
                  </span>
                  <span className="text-foreground font-bold tabular-nums">{r.users.toLocaleString()}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary/70 transition-all duration-700"
                    style={{ width: `${r.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="animate-fade-in-up stagger-4 rounded-2xl border border-border bg-card p-6 shadow-card hover:shadow-elevated transition-shadow">
          <div className="flex items-center gap-2 mb-5">
            <FileText className="h-4 w-4 text-primary" />
            <h3 className="text-base font-semibold text-foreground">Active Pages</h3>
          </div>
          <div className="space-y-3">
            {pages.map((p) => (
              <div key={p.path} className="flex items-center gap-3 py-1">
                <div className="h-2 w-2 rounded-full bg-primary shrink-0 animate-pulse-dot" />
                <span className="text-sm font-mono text-foreground flex-1 truncate">{p.path}</span>
                <span className="text-sm text-foreground font-semibold tabular-nums">
                  ~{Math.round(count * p.pct / 100)}
                </span>
                <span className="text-xs text-muted-foreground">users</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
