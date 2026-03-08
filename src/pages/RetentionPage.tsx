import { useState, useEffect } from "react";
import { FilterBar } from "@/components/FilterBar";
import { SkeletonCard } from "@/components/SkeletonCard";
import { cohortData, cohortColumns } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Users, CalendarDays, Layers, Info } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

function getCellBg(value: number | null): string {
  if (value === null) return "transparent";
  if (value >= 90) return "hsl(158, 64%, 35%)";
  if (value >= 75) return "hsl(158, 58%, 42%)";
  if (value >= 60) return "hsl(158, 52%, 50%)";
  if (value >= 45) return "hsl(158, 46%, 58%)";
  if (value >= 30) return "hsl(158, 40%, 66%)";
  if (value >= 15) return "hsl(158, 34%, 76%)";
  return "hsl(158, 28%, 88%)";
}

function getCellText(value: number | null): string {
  if (value === null) return "";
  return value >= 55 ? "hsl(0, 0%, 100%)" : "hsl(220, 20%, 10%)";
}

export default function RetentionPage() {
  const [loading, setLoading] = useState(true);
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
  const [selectedCohort, setSelectedCohort] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  const columnAvgs = cohortColumns.map((_, ci) => {
    const vals = cohortData.map((r) => r.retention[ci]).filter((v) => v !== null) as number[];
    return vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
  });

  const retentionCurveData = cohortColumns.map((col, i) => ({
    period: col,
    retention: columnAvgs[i],
  }));

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up stagger-1">
        <FilterBar title="Retention" subtitle="Cohort analysis — track how users return over time" />
      </div>

      {loading ? (
        <SkeletonCard lines={8} />
      ) : (
        <>
          {/* KPI Cards */}
          <div className="animate-fade-in-up stagger-2 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Day-1 Retention", value: "100%", sub: "All cohorts", icon: Users, trend: null },
              { label: "Day-7 Avg", value: "72%", sub: "Across cohorts", icon: CalendarDays, trend: "+3%" },
              { label: "Day-14 Avg", value: "57%", sub: "Across cohorts", icon: CalendarDays, trend: "+1.5%" },
              { label: "Day-30 Avg", value: "41%", sub: "Across cohorts", icon: CalendarDays, trend: "-2%" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-border bg-card p-5 shadow-card hover:shadow-elevated transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-muted-foreground">{stat.label}</span>
                  <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
                    <stat.icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-foreground tracking-tight">{stat.value}</div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] text-muted-foreground">{stat.sub}</span>
                  {stat.trend && (
                    <span className={cn(
                      "inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                      stat.trend.startsWith("+") ? "text-primary bg-accent" : "text-destructive bg-destructive/10"
                    )}>
                      {stat.trend.startsWith("+") ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                      {stat.trend}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Retention curve chart */}
          <div className="animate-fade-in-up stagger-3 rounded-2xl border border-border bg-card shadow-card overflow-hidden">
            <div className="px-8 py-5 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-foreground">Average Retention Curve</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Mean retention across all cohorts</p>
              </div>
              <div className="h-9 w-9 rounded-xl bg-accent flex items-center justify-center">
                <Layers className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={retentionCurveData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="retGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(158, 64%, 35%)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(158, 64%, 35%)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" vertical={false} />
                  <XAxis dataKey="period" tick={{ fontSize: 11, fill: "hsl(220, 10%, 50%)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(220, 10%, 50%)" }} axisLine={false} tickLine={false} unit="%" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ background: "hsl(0, 0%, 100%)", border: "1px solid hsl(220, 13%, 91%)", borderRadius: 12, fontSize: 12 }}
                    formatter={(value: number) => [`${value}%`, "Retention"]}
                  />
                  <Area type="monotone" dataKey="retention" stroke="hsl(158, 64%, 35%)" strokeWidth={2.5} fill="url(#retGrad)" dot={{ r: 4, fill: "hsl(158, 64%, 35%)", strokeWidth: 2, stroke: "hsl(0, 0%, 100%)" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cohort Heatmap — Dense Grid */}
          <div className="animate-fade-in-up stagger-4 rounded-2xl border border-border bg-card shadow-card overflow-hidden">
            <div className="px-8 py-5 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-foreground">Cohort Retention Heatmap</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Click any row to see detailed breakdown</p>
              </div>
              {/* Color scale legend */}
              <div className="hidden md:flex items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground mr-1">0%</span>
                {[88, 76, 66, 58, 50, 42, 35].map((lightness, i) => (
                  <div
                    key={i}
                    className="h-4 w-6 rounded-sm first:rounded-l-md last:rounded-r-md"
                    style={{ background: `hsl(158, ${28 + i * 6}%, ${lightness}%)` }}
                  />
                ))}
                <span className="text-[10px] text-muted-foreground ml-1">100%</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/40">
                    <th className="text-left px-6 py-3.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-[180px] sticky left-0 bg-muted/40 z-10">Cohort</th>
                    <th className="text-center px-4 py-3.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-[90px]">Users</th>
                    {cohortColumns.map((col) => (
                      <th key={col} className="text-center px-2 py-3.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider min-w-[80px]">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cohortData.map((row, ri) => {
                    const isSelected = selectedCohort === ri;
                    return (
                      <tr
                        key={row.cohort}
                        onClick={() => setSelectedCohort(isSelected ? null : ri)}
                        className={cn(
                          "cursor-pointer transition-all duration-200 group",
                          isSelected ? "bg-accent/60" : "hover:bg-muted/20"
                        )}
                      >
                        <td className={cn("px-6 py-0 sticky left-0 z-10 transition-colors", isSelected ? "bg-accent/60" : "bg-card group-hover:bg-muted/20")}>
                          <div className="flex items-center gap-2.5 py-3">
                            <div className={cn("h-2 w-2 rounded-full shrink-0 transition-colors", isSelected ? "bg-primary" : "bg-border")} />
                            <span className="text-sm font-medium text-foreground whitespace-nowrap">{row.cohort}</span>
                          </div>
                        </td>
                        <td className="text-center px-4 py-3">
                          <span className="text-xs font-mono font-semibold text-muted-foreground">{row.users.toLocaleString()}</span>
                        </td>
                        {row.retention.map((val, ci) => {
                          const isHovered = hoveredCell?.row === ri && hoveredCell?.col === ci;
                          return (
                            <td key={ci} className="px-1.5 py-1.5">
                              {val === null ? (
                                <div className="h-[52px] rounded-lg bg-muted/30 border border-dashed border-border/50 flex items-center justify-center">
                                  <span className="text-[10px] text-muted-foreground/40">—</span>
                                </div>
                              ) : (
                                <div
                                  className={cn(
                                    "h-[52px] rounded-lg flex items-center justify-center transition-all duration-200 relative",
                                    isHovered && "ring-2 ring-foreground/20 scale-[1.04] shadow-lg z-20"
                                  )}
                                  style={{ backgroundColor: getCellBg(val) }}
                                  onMouseEnter={() => setHoveredCell({ row: ri, col: ci })}
                                  onMouseLeave={() => setHoveredCell(null)}
                                >
                                  <span className="text-sm font-bold" style={{ color: getCellText(val) }}>
                                    {val}%
                                  </span>

                                  {/* Hover tooltip */}
                                  {isHovered && (
                                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-foreground text-background rounded-xl px-4 py-2.5 shadow-elevated whitespace-nowrap z-50 pointer-events-none">
                                      <div className="text-[10px] opacity-60 mb-0.5">{row.cohort} · {cohortColumns[ci]}</div>
                                      <div className="text-xs font-bold">{val}% retained · {Math.round(row.users * val / 100).toLocaleString()} users</div>
                                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 h-2.5 w-2.5 bg-foreground" />
                                    </div>
                                  )}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}

                  {/* Average row */}
                  <tr className="border-t-2 border-border bg-muted/30">
                    <td className="px-6 py-0 sticky left-0 bg-muted/30 z-10">
                      <div className="flex items-center gap-2.5 py-3">
                        <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                        <span className="text-sm font-bold text-foreground">Average</span>
                      </div>
                    </td>
                    <td className="text-center px-4 py-3 text-xs text-muted-foreground">—</td>
                    {columnAvgs.map((avg, ci) => (
                      <td key={ci} className="px-1.5 py-1.5">
                        <div className="h-[52px] rounded-lg bg-primary/10 border-2 border-primary/25 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">{avg}%</span>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Selected cohort detail */}
          {selectedCohort !== null && (
            <div className="animate-fade-in-up rounded-2xl border border-primary/20 bg-card shadow-card overflow-hidden">
              <div className="px-8 py-5 border-b border-border flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-accent flex items-center justify-center">
                  <Info className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">{cohortData[selectedCohort].cohort}</h4>
                  <p className="text-xs text-muted-foreground">{cohortData[selectedCohort].users.toLocaleString()} users in this cohort</p>
                </div>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {cohortData[selectedCohort].retention.map((val, ci) => {
                    if (val === null) return (
                      <div key={ci} className="rounded-xl border border-dashed border-border p-5 flex flex-col items-center justify-center opacity-40">
                        <span className="text-xs text-muted-foreground">{cohortColumns[ci]}</span>
                        <span className="text-lg font-bold text-muted-foreground mt-1">—</span>
                      </div>
                    );
                    return (
                      <div key={ci} className="rounded-xl border border-border p-5 hover:shadow-card transition-shadow">
                        <div className="text-xs text-muted-foreground font-medium mb-3">{cohortColumns[ci]}</div>
                        <div className="text-2xl font-bold text-foreground mb-2">{val}%</div>
                        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${val}%`,
                              background: getCellBg(val),
                            }}
                          />
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-2">{Math.round(cohortData[selectedCohort].users * val / 100).toLocaleString()} users retained</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}