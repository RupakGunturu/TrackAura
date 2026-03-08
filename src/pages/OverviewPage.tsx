import { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Users, Activity, Clock, MousePointerClick, ArrowUpRight, Zap } from "lucide-react";
import { FilterBar } from "@/components/FilterBar";
import { SkeletonKpiCard, SkeletonCard } from "@/components/SkeletonCard";
import { kpiCards, sparklines, dauSeries, deviceData, topPages } from "@/lib/mockData";
import { cn } from "@/lib/utils";

const COLORS = ["hsl(158,64%,35%)", "hsl(152,76%,55%)", "hsl(38,92%,50%)"];
const icons = [Users, Activity, MousePointerClick, Clock];

// Hourly traffic for bar chart
const hourlyTraffic = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i.toString().padStart(2, "0")}`,
  users: Math.round(800 + Math.sin(i / 3) * 500 + (i > 8 && i < 20 ? 600 : 0) + Math.random() * 200),
}));

// Conversion radial data
const conversionRadial = [
  { name: "Signup", value: 34.2, fill: "hsl(158,64%,35%)" },
  { name: "Activation", value: 22.1, fill: "hsl(152,76%,55%)" },
  { name: "Retention", value: 14.8, fill: "hsl(158,50%,70%)" },
];

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
                    "group relative rounded-2xl border border-border bg-card p-5 shadow-card hover:shadow-elevated hover:border-primary/20 transition-all duration-300 animate-fade-in-up overflow-hidden",
                    `stagger-${i + 1}`
                  )}
                >
                  {/* Subtle gradient accent */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full" />
                  
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-muted-foreground tracking-wide">
                        {card.title}
                      </span>
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon className="h-4.5 w-4.5 text-primary" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-foreground tracking-tight mb-2">
                      {card.value}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full",
                          card.positive ? "text-primary bg-accent" : "text-destructive bg-destructive/10"
                        )}
                      >
                        {card.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {card.change}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{card.sub}</span>
                    </div>
                    {/* Sparkline */}
                    <div className="mt-4 h-14 -mx-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={sparkData}>
                          <defs>
                            <linearGradient id={`spark-${i}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={card.positive ? "hsl(158,64%,35%)" : "hsl(0,84%,60%)"} stopOpacity={0.25} />
                              <stop offset="100%" stopColor={card.positive ? "hsl(158,64%,35%)" : "hsl(0,84%,60%)"} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <Area
                            type="monotone"
                            dataKey="v"
                            stroke={card.positive ? "hsl(158,64%,35%)" : "hsl(0,84%,60%)"}
                            strokeWidth={2}
                            fill={`url(#spark-${i})`}
                            dot={false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              );
            })}
      </div>

      {/* Main charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {loading ? (
          <>
            <SkeletonCard className="lg:col-span-2" lines={6} />
            <SkeletonCard lines={6} />
          </>
        ) : (
          <>
            {/* DAU Area chart */}
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
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={dauSeries} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gUsers2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(158,64%,35%)" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="hsl(158,64%,35%)" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="gSessions2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(152,76%,55%)" stopOpacity={0.20} />
                      <stop offset="100%" stopColor="hsl(152,76%,55%)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={4} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12, boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}
                    labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 700 }}
                    cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 1, strokeDasharray: "4 4" }}
                  />
                  <Area type="monotone" dataKey="users" stroke="hsl(158,64%,35%)" strokeWidth={2.5} fill="url(#gUsers2)" name="Users" />
                  <Area type="monotone" dataKey="sessions" stroke="hsl(152,76%,55%)" strokeWidth={2} fill="url(#gSessions2)" name="Sessions" />
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

            {/* Device donut + conversion radial */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-card animate-fade-in-up stagger-4">
                <h3 className="text-sm font-semibold text-foreground mb-1">Traffic by Device</h3>
                <p className="text-xs text-muted-foreground mb-3">Share of total sessions</p>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie data={deviceData} cx="50%" cy="50%" innerRadius={42} outerRadius={65} paddingAngle={5} dataKey="value" strokeWidth={0}>
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
                <div className="space-y-2 mt-2">
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

              {/* Quick conversion metric */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-card animate-fade-in-up stagger-5">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Conversion Rate</h3>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">9.3%</div>
                  <p className="text-xs text-muted-foreground mt-1">Visitor → Active User</p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <TrendingUp className="h-3 w-3 text-primary" />
                    <span className="text-xs font-semibold text-primary">+1.2%</span>
                    <span className="text-[10px] text-muted-foreground">vs last period</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Hourly traffic bar chart + Top Pages */}
      {!loading && (
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Hourly traffic */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card animate-fade-in-up stagger-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-semibold text-foreground">Hourly Traffic</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Users per hour today</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={hourlyTraffic} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={3} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12, boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}
                  formatter={(v: number) => [v.toLocaleString(), "Users"]}
                  cursor={{ fill: "hsl(var(--primary) / 0.05)" }}
                />
                <Bar dataKey="users" radius={[4, 4, 0, 0]}>
                  {hourlyTraffic.map((entry, index) => (
                    <Cell key={index} fill={entry.users > 1500 ? "hsl(158,64%,35%)" : "hsl(158,64%,35%,0.4)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Pages */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card animate-fade-in-up stagger-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-semibold text-foreground">Top Pages</h3>
                <p className="text-xs text-muted-foreground mt-0.5">By page views this period</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-primary font-medium cursor-pointer hover:underline">
                View all <ArrowUpRight className="h-3 w-3" />
              </div>
            </div>
            <div className="space-y-4">
              {topPages.map((page, i) => {
                const pct = Math.round((page.views / topPages[0].views) * 100);
                return (
                  <div key={page.path} className="group">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center h-6 w-6 rounded-lg bg-muted text-xs font-bold text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          {i + 1}
                        </span>
                        <span className="text-sm font-mono text-foreground truncate">{page.path}</span>
                      </div>
                      <span className="text-sm text-foreground font-bold tabular-nums">
                        {page.views.toLocaleString()}
                      </span>
                    </div>
                    <div className="ml-9 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="ml-9 mt-1 text-[10px] text-muted-foreground">{page.bounce} bounce rate</div>
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
