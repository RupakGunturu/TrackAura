import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { FilterBar } from "@/components/FilterBar";
import { SkeletonCard } from "@/components/SkeletonCard";
import { cohortData, cohortColumns } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Users, CalendarDays } from "lucide-react";

function getColor(value: number | null): string {
  if (value === null) return "hsl(var(--muted))";
  if (value >= 90) return "hsl(158, 64%, 25%)";
  if (value >= 70) return "hsl(158, 60%, 33%)";
  if (value >= 50) return "hsl(158, 56%, 42%)";
  if (value >= 35) return "hsl(158, 50%, 55%)";
  if (value >= 20) return "hsl(158, 46%, 68%)";
  return "hsl(158, 42%, 82%)";
}

function getTextColor(value: number | null): string {
  if (value === null) return "hsl(var(--muted-foreground))";
  if (value >= 50) return "hsl(0,0%,100%)";
  return "hsl(158, 64%, 20%)";
}

// Bar chart data for retention comparison
const retentionBarData = cohortColumns.map((col, ci) => {
  const values = cohortData.map((r) => r.retention[ci]).filter((v) => v !== null) as number[];
  const avg = values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
  return { name: col, avg };
});

export default function RetentionPage() {
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState<{ cohort: string; column: string; value: number; users: number } | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up stagger-1">
        <FilterBar title="Retention" subtitle="Cohort analysis — track how users return over time" />
      </div>

      {loading ? (
        <SkeletonCard lines={8} />
      ) : (
        <>
          {/* Summary stats */}
          <div className="animate-fade-in-up stagger-2 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Day-1 Retention", value: "100%", sub: "All cohorts", icon: Users, trend: null },
              { label: "Day-7 Retention", value: "72%", sub: "7-day avg", icon: CalendarDays, trend: "+3%" },
              { label: "Day-14 Retention", value: "57%", sub: "14-day avg", icon: CalendarDays, trend: "+1.5%" },
              { label: "Day-30 Retention", value: "41%", sub: "30-day avg", icon: CalendarDays, trend: "-2%" },
            ].map((stat) => (
              <div key={stat.label} className="group rounded-2xl border border-border bg-card p-5 shadow-card hover:shadow-elevated hover:border-primary/20 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
                    <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
                      <stat.icon className="h-3.5 w-3.5 text-primary" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-primary tracking-tight">{stat.value}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-muted-foreground">{stat.sub}</span>
                    {stat.trend && (
                      <span className={cn(
                        "inline-flex items-center gap-0.5 text-[10px] font-semibold",
                        stat.trend.startsWith("+") ? "text-primary" : "text-destructive"
                      )}>
                        {stat.trend.startsWith("+") ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                        {stat.trend}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Retention bar chart + legend */}
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Bar chart */}
            <div className="lg:col-span-2 animate-fade-in-up stagger-3 rounded-2xl border border-border bg-card p-6 shadow-card">
              <h3 className="text-base font-semibold text-foreground mb-1">Average Retention by Period</h3>
              <p className="text-xs text-muted-foreground mb-5">Mean retention across all cohorts</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={retentionBarData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--foreground))", fontWeight: 500 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12, boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}
                    formatter={(v: number) => [`${v}%`, "Avg Retention"]}
                    cursor={{ fill: "hsl(var(--primary) / 0.05)" }}
                  />
                  <Bar dataKey="avg" radius={[8, 8, 0, 0]} barSize={48}>
                    {retentionBarData.map((entry, index) => (
                      <Cell key={index} fill={`hsl(158, ${64 - index * 8}%, ${35 + index * 6}%)`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="animate-fade-in-up stagger-3 rounded-2xl border border-border bg-card p-5 shadow-card">
              <h3 className="text-sm font-semibold text-foreground mb-4">Color Scale</h3>
              <div className="space-y-2.5">
                {[
                  { label: "90%+", bg: "hsl(158, 64%, 25%)", text: "hsl(0,0%,100%)" },
                  { label: "70-89%", bg: "hsl(158, 60%, 33%)", text: "hsl(0,0%,100%)" },
                  { label: "50-69%", bg: "hsl(158, 56%, 42%)", text: "hsl(0,0%,100%)" },
                  { label: "35-49%", bg: "hsl(158, 50%, 55%)", text: "hsl(158, 64%, 15%)" },
                  { label: "20-34%", bg: "hsl(158, 46%, 68%)", text: "hsl(158, 64%, 15%)" },
                  { label: "<20%", bg: "hsl(158, 42%, 82%)", text: "hsl(158, 64%, 20%)" },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-3">
                    <div className="h-6 w-12 rounded-md" style={{ background: l.bg }} />
                    <span className="text-xs text-muted-foreground font-medium">{l.label}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-border">
                <div className="text-xs text-muted-foreground mb-2">Best Cohort</div>
                <div className="text-sm font-bold text-foreground">Week 5 (Feb 3)</div>
                <div className="text-xs text-primary font-semibold mt-0.5">47% Day-30 retention</div>
              </div>
            </div>
          </div>

          {/* Cohort heatmap table */}
          <div className="animate-fade-in-up stagger-4 rounded-2xl border border-border bg-card shadow-card overflow-hidden">
            <div className="px-6 py-5 border-b border-border">
              <h3 className="text-base font-semibold text-foreground">Cohort Heatmap</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Weekly cohort retention breakdown</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="bg-muted/30">
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">Cohort</th>
                    <th className="text-center px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">Users</th>
                    {cohortColumns.map((col) => (
                      <th key={col} className="text-center px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cohortData.map((row) => (
                    <tr key={row.cohort} className="border-b border-border last:border-0 hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-3.5 text-sm font-medium text-foreground whitespace-nowrap">{row.cohort}</td>
                      <td className="px-4 py-3.5 text-center text-sm font-mono text-muted-foreground font-semibold">{row.users.toLocaleString()}</td>
                      {row.retention.map((val, ci) => {
                        const isNull = val === null;
                        return (
                          <td key={ci} className="px-4 py-3.5 text-center">
                            <div
                              className={cn(
                                "mx-auto w-16 h-11 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-200",
                                !isNull && "cursor-pointer hover:scale-110 hover:shadow-lg hover:ring-2 hover:ring-primary/30"
                              )}
                              style={{ background: getColor(val), color: getTextColor(val) }}
                              onMouseEnter={(e) => {
                                if (!isNull) {
                                  setTooltip({ cohort: row.cohort, column: cohortColumns[ci], value: val as number, users: Math.round(row.users * (val as number) / 100) });
                                  const rect = (e.target as HTMLElement).getBoundingClientRect();
                                  setTooltipPos({ x: rect.left, y: rect.top });
                                }
                              }}
                              onMouseLeave={() => setTooltip(null)}
                            >
                              {isNull ? "—" : `${val}%`}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Floating tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none rounded-xl border border-border bg-card shadow-elevated px-4 py-3 text-xs"
          style={{ top: tooltipPos.y - 90, left: tooltipPos.x - 60 }}
        >
          <div className="font-semibold text-foreground text-sm">{tooltip.cohort}</div>
          <div className="text-muted-foreground">{tooltip.column}</div>
          <div className="flex gap-4 mt-1.5">
            <span>Retention: <strong className="text-primary">{tooltip.value}%</strong></span>
            <span>Users: <strong className="text-foreground">{tooltip.users.toLocaleString()}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}
