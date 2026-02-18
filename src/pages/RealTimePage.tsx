import { useState, useEffect, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FilterBar } from "@/components/FilterBar";
import { generateRealtimeData } from "@/lib/mockData";
import { cn } from "@/lib/utils";

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

  // Regional live data
  const regions = [
    { name: "North America", pct: 38, users: Math.round(count * 0.38) },
    { name: "Europe", pct: 27, users: Math.round(count * 0.27) },
    { name: "Asia-Pacific", pct: 22, users: Math.round(count * 0.22) },
    { name: "Rest of World", pct: 13, users: Math.round(count * 0.13) },
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
      <div className="animate-fade-in-up stagger-2 rounded-xl border border-border bg-card shadow-card overflow-hidden">
        <div className="bg-gradient-to-br from-primary/5 to-transparent p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex items-center gap-4">
            {/* Pulsing dot */}
            <div className="relative">
              <div className="h-5 w-5 rounded-full bg-primary opacity-20 absolute inset-0 animate-ping" />
              <div className="h-5 w-5 rounded-full bg-primary relative z-10 flex items-center justify-center">
                <div className="h-2.5 w-2.5 rounded-full bg-primary-foreground" />
              </div>
            </div>
            <div>
              <div
                className={cn(
                  "text-5xl font-bold tracking-tighter tabular-nums transition-all duration-500",
                  trend === "up" && "text-primary",
                  trend === "down" && "text-destructive",
                  trend === "stable" && "text-foreground"
                )}
              >
                {count.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground mt-1 font-medium">users online now</div>
            </div>
          </div>
          <div className="sm:ml-auto text-right">
            <div className="text-xs text-muted-foreground">Last updated</div>
            <div className="text-sm font-mono text-foreground mt-0.5">
              {lastUpdated.toLocaleTimeString()}
            </div>
            <div className={cn(
              "text-xs font-medium mt-1",
              trend === "up" && "text-primary",
              trend === "down" && "text-destructive",
              trend === "stable" && "text-muted-foreground"
            )}>
              {trend === "up" ? "↑ Increasing" : trend === "down" ? "↓ Decreasing" : "→ Stable"}
            </div>
          </div>
        </div>

        {/* Sparkline */}
        <div className="px-6 pb-6">
          <p className="text-xs text-muted-foreground mb-3">Last 60 readings (2s interval)</p>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={data} margin={{ top: 4, right: 4, left: -30, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 2" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="t" hide />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} domain={["auto", "auto"]} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                labelFormatter={() => "Users"}
                formatter={(v: number) => [v.toLocaleString(), "Online"]}
              />
              <Line
                type="monotone"
                dataKey="v"
                stroke="hsl(158,64%,35%)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "hsl(158,64%,35%)" }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Regional breakdown + Active pages */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="animate-fade-in-up stagger-3 rounded-xl border border-border bg-card p-5 shadow-card">
          <h3 className="text-sm font-semibold text-foreground mb-1">Users by Region</h3>
          <p className="text-xs text-muted-foreground mb-4">Live geographic distribution</p>
          <div className="space-y-3">
            {regions.map((r) => (
              <div key={r.name}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-foreground font-medium">{r.name}</span>
                  <span className="text-muted-foreground font-mono">{r.users.toLocaleString()}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-700"
                    style={{ width: `${r.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="animate-fade-in-up stagger-4 rounded-xl border border-border bg-card p-5 shadow-card">
          <h3 className="text-sm font-semibold text-foreground mb-1">Active Pages</h3>
          <p className="text-xs text-muted-foreground mb-4">Top pages being viewed right now</p>
          <div className="space-y-2">
            {pages.map((p) => (
              <div key={p.path} className="flex items-center gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 animate-pulse-dot" />
                <span className="text-xs font-mono text-foreground flex-1 truncate">{p.path}</span>
                <span className="text-xs text-muted-foreground font-medium">
                  ~{Math.round(count * p.pct / 100)} users
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
