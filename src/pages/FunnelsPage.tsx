import { useState, useEffect } from "react";
import { FilterBar } from "@/components/FilterBar";
import { SkeletonCard } from "@/components/SkeletonCard";
import { funnelStages } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDown, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// Funnel bar chart data
const funnelBarData = funnelStages.map((s, i) => ({
  name: s.name,
  value: s.value,
  fill: `hsl(158, ${64 - i * 6}%, ${35 + i * 5}%)`,
}));

export default function FunnelsPage() {
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const maxVal = funnelStages[0].value;

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up stagger-1">
        <FilterBar title="Conversion Funnel" subtitle="Track how users move through your key flows" />
      </div>

      {loading ? (
        <SkeletonCard lines={10} />
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up stagger-2">
            {[
              { label: "Total Visitors", value: "100K", change: "+12%", positive: true },
              { label: "Signups", value: "34.2K", change: "+8.4%", positive: true },
              { label: "Active Users", value: "9.3K", change: "-2.1%", positive: false },
              { label: "Overall Conv.", value: "9.3%", change: "+1.2%", positive: true },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <div className="text-xs text-muted-foreground mb-1.5">{stat.label}</div>
                <div className="text-2xl font-bold text-foreground tracking-tight">{stat.value}</div>
                <span className={cn(
                  "inline-flex items-center gap-1 text-xs font-semibold mt-1",
                  stat.positive ? "text-primary" : "text-destructive"
                )}>
                  {stat.positive ? <ArrowUpRight className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {stat.change}
                </span>
              </div>
            ))}
          </div>

          {/* Visual funnel + Bar chart side by side */}
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Visual funnel */}
            <div className="animate-fade-in-up stagger-3 rounded-2xl border border-border bg-card p-6 shadow-card">
              <h3 className="text-base font-semibold text-foreground mb-6">Funnel Stages</h3>
              <div className="flex flex-col items-center gap-0 select-none">
                {funnelStages.map((stage, i) => {
                  const pct = (stage.value / maxVal) * 100;
                  const next = funnelStages[i + 1];
                  const dropoff = next ? (((stage.value - next.value) / stage.value) * 100).toFixed(1) : null;

                  return (
                    <div key={stage.name} className="w-full flex flex-col items-center">
                      <div
                        className="relative w-full flex justify-center cursor-pointer group"
                        style={{ paddingLeft: `${(100 - pct) / 2}%`, paddingRight: `${(100 - pct) / 2}%` }}
                        onMouseEnter={() => setHovered(i)}
                        onMouseLeave={() => setHovered(null)}
                      >
                        <div
                          className={cn(
                            "w-full h-14 rounded-xl flex items-center justify-between px-5 transition-all duration-200 relative overflow-hidden",
                            hovered === i ? "scale-[1.02] shadow-lg" : ""
                          )}
                          style={{ backgroundColor: `hsl(158, ${64 - i * 6}%, ${35 + i * 5}%)` }}
                        >
                          {/* Shimmer effect on hover */}
                          {hovered === i && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                          )}
                          <span className="text-sm font-bold text-white relative z-10">{stage.name}</span>
                          <div className="text-right relative z-10">
                            <div className="text-sm font-bold text-white tabular-nums">{stage.value.toLocaleString()}</div>
                            <div className="text-[10px] text-white/70">{pct.toFixed(1)}%</div>
                          </div>
                        </div>
                      </div>
                      {dropoff && (
                        <div className="flex items-center gap-2 my-2">
                          <div className="h-5 w-px bg-border" />
                          <div className="flex items-center gap-1 text-[11px] text-destructive font-semibold bg-destructive/8 border border-destructive/15 rounded-full px-2.5 py-1">
                            <ArrowDown className="h-3 w-3" />
                            {dropoff}% drop-off
                          </div>
                          <div className="h-5 w-px bg-border" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Horizontal bar chart */}
            <div className="animate-fade-in-up stagger-4 rounded-2xl border border-border bg-card p-6 shadow-card">
              <h3 className="text-base font-semibold text-foreground mb-2">Stage Comparison</h3>
              <p className="text-xs text-muted-foreground mb-5">Users at each funnel stage</p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={funnelBarData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--foreground))", fontWeight: 500 }} tickLine={false} axisLine={false} width={100} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12, boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}
                    formatter={(v: number) => [v.toLocaleString(), "Users"]}
                    cursor={{ fill: "hsl(var(--primary) / 0.05)" }}
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={32}>
                    {funnelBarData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Summary table */}
          <div className="animate-fade-in-up stagger-5 rounded-2xl border border-border bg-card shadow-card overflow-hidden">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">Stage Details</h3>
              <div className="flex items-center gap-1.5 text-xs text-primary font-medium cursor-pointer hover:underline">
                Export <ArrowUpRight className="h-3 w-3" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stage</th>
                    <th className="text-right px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Users</th>
                    <th className="text-right px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">% of Top</th>
                    <th className="text-right px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Conversion</th>
                    <th className="text-right px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Drop-off</th>
                  </tr>
                </thead>
                <tbody>
                  {funnelStages.map((stage, i) => {
                    const next = funnelStages[i + 1];
                    const prev = funnelStages[i - 1];
                    const convFromPrev = prev ? ((stage.value / prev.value) * 100).toFixed(1) : "100.0";
                    return (
                      <tr key={stage.name} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: `hsl(158, ${64 - i * 6}%, ${35 + i * 5}%)` }} />
                          <span className="text-foreground font-medium">{stage.name}</span>
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-foreground font-bold">{stage.value.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right text-foreground">{((stage.value / maxVal) * 100).toFixed(1)}%</td>
                        <td className="px-6 py-4 text-right text-primary font-semibold">{convFromPrev}%</td>
                        <td className="px-6 py-4 text-right">
                          {next ? (
                            <span className="text-destructive font-semibold">
                              -{(((stage.value - next.value) / stage.value) * 100).toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
