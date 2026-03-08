import { useState, useEffect } from "react";
import {
  AreaChart, Area, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, Users, Activity, Clock, MousePointerClick, ArrowUpRight } from "lucide-react";
import { FilterBar } from "@/components/FilterBar";
import { SkeletonKpiCard, SkeletonCard } from "@/components/SkeletonCard";
import { kpiCards, sparklines, dauSeries, deviceData, topPages } from "@/lib/mockData";
import { cn } from "@/lib/utils";

const COLORS = ["hsl(158,64%,35%)", "hsl(152,76%,55%)", "hsl(38,92%,50%)"];
const icons = [Users, Activity, MousePointerClick, Clock];

export default function OverviewPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up stagger-1">
        <FilterBar title="Overview" subtitle="Your analytics at a glance" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonKpiCard key={i} />)
          : kpiCards.map((card, i) => {
              const Icon = icons[i];
              const sparkData = sparklines[card.title].map((v, j) => ({ v, j }));
              return (
                <div
                  key={card.title}
                  className={cn(
                    "group rounded-2xl border border-border bg-card p-5 shadow-card hover:shadow-elevated hover:border-primary/20 transition-all duration-300 animate-fade-in-up",
                    `stagger-${i + 1}`
                  )}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-medium text-muted-foreground tracking-wide">
                      {card.title}
                    </span>
                    <div className="h-9 w-9 rounded-xl bg-accent flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-foreground tracking-tight mb-1.5">
                    {card.value}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full",
                        card.positive ? "text-primary bg-accent" : "text-destructive bg-destructive/10"
                      )}
                    >
                      {card.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {card.change}
                    </span>
                    <span className="text-[11px] text-muted-foreground">{card.sub}</span>
                  </div>
                  {/* Sparkline */}
                  <div className="mt-4 h-12">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={sparkData}>
                        <defs>
                          <linearGradient id={`spark-${i}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={card.positive ? "hsl(158,64%,35%)" : "hsl(0,84%,60%)"} stopOpacity={0.2} />
                            <stop offset="95%" stopColor={card.positive ? "hsl(158,64%,35%)" : "hsl(0,84%,60%)"} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area
                          type="monotone"
                          dataKey="v"
                          stroke={card.positive ? "hsl(158,64%,35%)" : "hsl(0,84%,60%)"}
                          strokeWidth={1.5}
                          fill={`url(#spark-${i})`}
                          dot={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            })}
      </div>

      {/* DAU Chart + Device Pie */}
      <div className="grid lg:grid-cols-3 gap-4">
        {loading ? (
          <>
            <SkeletonCard className="lg:col-span-2" lines={5} />
            <SkeletonCard lines={5} />
          </>
        ) : (
          <>
            <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-card animate-fade-in-up stagger-3">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-semibold text-foreground">Daily Active Users</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Users & Sessions — last 30 days</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-primary font-medium cursor-pointer hover:underline">
                  View details <ArrowUpRight className="h-3 w-3" />
                </div>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={dauSeries} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(158,64%,35%)" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="hsl(158,64%,35%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gSessions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(152,76%,55%)" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="hsl(152,76%,55%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={4} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12, boxShadow: "var(--shadow-elevated)" }}
                    labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                  />
                  <Area type="monotone" dataKey="users" stroke="hsl(158,64%,35%)" strokeWidth={2} fill="url(#gUsers)" name="Users" />
                  <Area type="monotone" dataKey="sessions" stroke="hsl(152,76%,55%)" strokeWidth={2} fill="url(#gSessions)" name="Sessions" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex gap-5 mt-3 pt-3 border-t border-border">
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="h-2.5 w-2.5 rounded-full bg-primary inline-block" /> Users
                </span>
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="h-2.5 w-2.5 rounded-full bg-chart-2 inline-block" /> Sessions
                </span>
              </div>
            </div>

            {/* Device pie */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card animate-fade-in-up stagger-4">
              <h3 className="text-base font-semibold text-foreground mb-1">Traffic by Device</h3>
              <p className="text-xs text-muted-foreground mb-5">Share of total sessions</p>
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie data={deviceData} cx="50%" cy="50%" innerRadius={50} outerRadius={78} paddingAngle={4} dataKey="value" strokeWidth={0}>
                    {deviceData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
                    formatter={(v: number) => [`${v}%`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2.5 mt-3 pt-3 border-t border-border">
                {deviceData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full inline-block" style={{ background: COLORS[i] }} />
                      <span className="text-foreground font-medium">{d.name}</span>
                    </span>
                    <span className="font-bold text-foreground">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Top Pages */}
      {!loading && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card animate-fade-in-up stagger-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold text-foreground">Top Pages</h3>
              <p className="text-xs text-muted-foreground mt-0.5">By page views this period</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-primary font-medium cursor-pointer hover:underline">
              View all <ArrowUpRight className="h-3 w-3" />
            </div>
          </div>
          <div className="space-y-3.5">
            {topPages.map((page, i) => {
              const pct = Math.round((page.views / topPages[0].views) * 100);
              return (
                <div key={page.path} className="flex items-center gap-4">
                  <span className="flex items-center justify-center text-xs text-muted-foreground w-5 shrink-0 font-mono">{i + 1}</span>
                  <span className="text-sm font-mono text-foreground w-36 shrink-0 truncate">{page.path}</span>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary/70 transition-all duration-700" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-sm text-foreground font-semibold w-16 text-right shrink-0">
                    {page.views.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground w-16 text-right shrink-0">
                    {page.bounce} bounce
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
