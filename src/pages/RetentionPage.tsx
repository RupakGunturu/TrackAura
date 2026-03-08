import { useState, useEffect } from "react";
import { FilterBar } from "@/components/FilterBar";
import { SkeletonCard } from "@/components/SkeletonCard";
import { cohortData, cohortColumns } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Users, CalendarDays, Layers } from "lucide-react";

function getColor(value: number | null): string {
  if (value === null) return "transparent";
  if (value >= 90) return "hsl(var(--primary))";
  if (value >= 70) return "hsl(158, 60%, 40%)";
  if (value >= 50) return "hsl(158, 50%, 50%)";
  if (value >= 35) return "hsl(158, 45%, 62%)";
  if (value >= 20) return "hsl(158, 40%, 75%)";
  return "hsl(158, 35%, 88%)";
}

function getOpacity(value: number | null): number {
  if (value === null) return 0;
  return 0.15 + (value / 100) * 0.85;
}

export default function RetentionPage() {
  const [loading, setLoading] = useState(true);
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
  const [selectedCohort, setSelectedCohort] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  // Compute averages per column
  const columnAvgs = cohortColumns.map((_, ci) => {
    const vals = cohortData.map((r) => r.retention[ci]).filter((v) => v !== null) as number[];
    return vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
  });

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

          {/* Retention curve - average line */}
          <div className="animate-fade-in-up stagger-3 rounded-2xl border border-border bg-card shadow-card overflow-hidden">
            <div className="px-8 py-6 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Average Retention Curve</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Mean retention across all cohorts per period</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center">
                <Layers className="h-4.5 w-4.5 text-primary" />
              </div>
            </div>
            <div className="p-8">
              <div className="flex items-end gap-3 h-[180px]">
                {columnAvgs.map((avg, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs font-bold text-foreground">{avg}%</span>
                    <div className="w-full relative rounded-t-lg overflow-hidden" style={{ height: `${avg * 1.6}px` }}>
                      <div
                        className="absolute inset-0 rounded-t-lg transition-all duration-500"
                        style={{
                          background: `linear-gradient(to top, hsl(var(--primary)), hsl(158, 50%, ${50 + i * 5}%))`,
                          opacity: 0.85
                        }}
                      />
                      <div className="absolute inset-0 rounded-t-lg bg-gradient-to-t from-transparent to-white/10" />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-medium">{cohortColumns[i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cohort heatmap - bubble grid */}
          <div className="animate-fade-in-up stagger-4 rounded-2xl border border-border bg-card shadow-card overflow-hidden">
            <div className="px-8 py-6 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Cohort Heatmap</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Bubble size and color represent retention strength. Click a row for details.</p>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">Weak</span>
                {[12, 16, 20, 24, 28, 32].map((size, i) => (
                  <div
                    key={i}
                    className="rounded-full"
                    style={{
                      width: size,
                      height: size,
                      background: `hsl(158, ${40 + i * 5}%, ${65 - i * 7}%)`,
                    }}
                  />
                ))}
                <span className="text-[10px] text-muted-foreground">Strong</span>
              </div>
            </div>
            <div className="overflow-x-auto p-6">
              {/* Header row */}
              <div className="flex items-center mb-2 pl-[140px]">
                <div className="w-[72px] shrink-0 text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Users</div>
                {cohortColumns.map((col) => (
                  <div key={col} className="w-[64px] shrink-0 text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{col}</div>
                ))}
              </div>

              {/* Data rows */}
              {cohortData.map((row, ri) => {
                const isSelected = selectedCohort === ri;
                return (
                  <div
                    key={row.cohort}
                    onClick={() => setSelectedCohort(isSelected ? null : ri)}
                    className={cn(
                      "flex items-center py-2 px-2 rounded-xl cursor-pointer transition-all duration-200",
                      isSelected ? "bg-accent/50 shadow-sm" : "hover:bg-muted/30"
                    )}
                  >
                    {/* Cohort label */}
                    <div className="w-[140px] shrink-0 flex items-center gap-2">
                      <div className={cn(
                        "h-2.5 w-2.5 rounded-full transition-colors",
                        isSelected ? "bg-primary" : "bg-muted-foreground/20"
                      )} />
                      <span className="text-sm font-medium text-foreground truncate">{row.cohort}</span>
                    </div>

                    {/* Users count */}
                    <div className="w-[72px] shrink-0 text-center text-xs font-mono text-muted-foreground font-semibold">
                      {row.users.toLocaleString()}
                    </div>

                    {/* Retention bubbles */}
                    {row.retention.map((val, ci) => {
                      const isNull = val === null;
                      const isHovered = hoveredCell?.row === ri && hoveredCell?.col === ci;
                      const bubbleSize = isNull ? 0 : 14 + ((val as number) / 100) * 26;

                      return (
                        <div key={ci} className="w-[64px] shrink-0 flex items-center justify-center h-[48px] relative">
                          {isNull ? (
                            <div className="h-3 w-3 rounded-full border-2 border-dashed border-muted-foreground/15" />
                          ) : (
                            <div
                              className={cn(
                                "rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer relative",
                                isHovered && "ring-3 ring-primary/30 scale-110 shadow-lg"
                              )}
                              style={{
                                width: bubbleSize,
                                height: bubbleSize,
                                background: `radial-gradient(circle at 35% 35%, hsl(158, ${40 + (val as number) * 0.3}%, ${70 - (val as number) * 0.35}%), hsl(158, ${50 + (val as number) * 0.2}%, ${55 - (val as number) * 0.3}%))`,
                                boxShadow: isHovered ? `0 4px 20px hsl(158, 50%, 40% / 0.3)` : `0 1px 4px hsl(158, 50%, 40% / 0.1)`,
                              }}
                              onMouseEnter={(e) => { e.stopPropagation(); setHoveredCell({ row: ri, col: ci }); }}
                              onMouseLeave={() => setHoveredCell(null)}
                            >
                              <span className={cn(
                                "text-[9px] font-bold transition-opacity",
                                (val as number) >= 40 ? "text-white" : "text-foreground",
                                bubbleSize < 24 ? "opacity-0" : "opacity-100"
                              )}>
                                {val}
                              </span>

                              {/* Tooltip */}
                              {isHovered && (
                                <div className="absolute -top-[52px] left-1/2 -translate-x-1/2 bg-foreground text-background rounded-lg px-3 py-2 shadow-elevated whitespace-nowrap z-50 pointer-events-none">
                                  <div className="text-[10px] opacity-70">{row.cohort} · {cohortColumns[ci]}</div>
                                  <div className="text-xs font-bold">{val}% · {Math.round(row.users * (val as number) / 100).toLocaleString()} users</div>
                                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 h-2 w-2 bg-foreground" />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {/* Average row */}
              <div className="flex items-center py-3 px-2 mt-2 rounded-xl bg-muted/40 border-t-2 border-border">
                <div className="w-[140px] shrink-0 text-sm font-bold text-foreground">Average</div>
                <div className="w-[72px] shrink-0 text-center text-xs text-muted-foreground">—</div>
                {columnAvgs.map((avg, ci) => (
                  <div key={ci} className="w-[64px] shrink-0 flex items-center justify-center h-[48px]">
                    <div className="h-10 w-10 rounded-full bg-primary/15 border-2 border-primary/30 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-primary">{avg}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Selected cohort breakdown */}
          {selectedCohort !== null && (
            <div className="animate-fade-in-up rounded-2xl border border-primary/20 bg-accent/30 p-6 shadow-card">
              <h4 className="text-base font-semibold text-foreground mb-1">
                {cohortData[selectedCohort].cohort} — {cohortData[selectedCohort].users.toLocaleString()} users
              </h4>
              <p className="text-xs text-muted-foreground mb-4">Retention breakdown for this cohort</p>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {cohortData[selectedCohort].retention.map((val, ci) => {
                  if (val === null) return null;
                  return (
                    <div key={ci} className="flex flex-col items-center gap-2 min-w-[80px]">
                      <div className="text-xs font-semibold text-muted-foreground">{cohortColumns[ci]}</div>
                      <div className="relative w-16 h-24 rounded-xl bg-muted overflow-hidden">
                        <div
                          className="absolute bottom-0 w-full rounded-t-lg transition-all duration-700"
                          style={{
                            height: `${val}%`,
                            background: `linear-gradient(to top, hsl(var(--primary)), hsl(158, 50%, 55%))`,
                          }}
                        />
                      </div>
                      <div className="text-xs font-bold text-foreground">{val}%</div>
                      <div className="text-[10px] text-muted-foreground">{Math.round(cohortData[selectedCohort].users * val / 100).toLocaleString()}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
