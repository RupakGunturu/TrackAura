import { useState, useEffect } from "react";
import { FilterBar } from "@/components/FilterBar";
import { SkeletonCard } from "@/components/SkeletonCard";
import { cohortData, cohortColumns } from "@/lib/mockData";
import { cn } from "@/lib/utils";

function getColor(value: number | null): string {
  if (value === null) return "hsl(var(--muted))";
  if (value >= 90) return "hsl(158, 64%, 28%)";
  if (value >= 70) return "hsl(158, 60%, 35%)";
  if (value >= 50) return "hsl(158, 56%, 44%)";
  if (value >= 35) return "hsl(158, 52%, 55%)";
  if (value >= 20) return "hsl(158, 48%, 70%)";
  return "hsl(158, 44%, 85%)";
}

function getTextColor(value: number | null): string {
  if (value === null) return "hsl(var(--muted-foreground))";
  if (value >= 50) return "hsl(0,0%,100%)";
  return "hsl(158, 64%, 22%)";
}

interface CellTooltipProps {
  cohort: string;
  column: string;
  value: number;
  users: number;
}

export default function RetentionPage() {
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState<CellTooltipProps | null>(null);
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
          {/* Legend */}
          <div className="animate-fade-in-up stagger-2 flex flex-wrap items-center gap-3">
            <span className="text-xs text-muted-foreground font-medium">Retention intensity:</span>
            {[
              { label: "100%", bg: "hsl(158, 64%, 28%)", text: "hsl(0,0%,100%)" },
              { label: "70%+", bg: "hsl(158, 56%, 44%)", text: "hsl(0,0%,100%)" },
              { label: "50%+", bg: "hsl(158, 52%, 55%)", text: "hsl(158, 64%, 20%)" },
              { label: "35%+", bg: "hsl(158, 48%, 70%)", text: "hsl(158, 64%, 20%)" },
              { label: "<35%", bg: "hsl(158, 44%, 85%)", text: "hsl(158, 64%, 22%)" },
            ].map((l) => (
              <span
                key={l.label}
                className="text-[11px] font-medium px-2 py-0.5 rounded"
                style={{ background: l.bg, color: l.text }}
              >
                {l.label}
              </span>
            ))}
          </div>

          {/* Heatmap */}
          <div className="animate-fade-in-up stagger-3 rounded-xl border border-border bg-card shadow-card overflow-hidden relative">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Weekly Cohort Retention</h3>
              <p className="text-xs text-muted-foreground">Percentage of users who returned on Day 1, 7, 14, 30</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[500px]">
                <thead>
                  <tr className="bg-muted/40">
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide border-b border-border whitespace-nowrap">
                      Cohort
                    </th>
                    <th className="text-center px-3 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide border-b border-border whitespace-nowrap">
                      Users
                    </th>
                    {cohortColumns.map((col) => (
                      <th
                        key={col}
                        className="text-center px-3 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide border-b border-border whitespace-nowrap"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cohortData.map((row, ri) => (
                    <tr key={row.cohort} className="border-b border-border last:border-0">
                      <td className="px-5 py-2 text-xs font-medium text-foreground whitespace-nowrap">{row.cohort}</td>
                      <td className="px-3 py-2 text-center text-xs font-mono text-muted-foreground">{row.users.toLocaleString()}</td>
                      {row.retention.map((val, ci) => {
                        const isNull = val === null;
                        return (
                          <td key={ci} className="px-3 py-2 text-center">
                            <div
                              className={cn(
                                "mx-auto w-14 h-9 rounded flex items-center justify-center text-xs font-semibold transition-all duration-150",
                                !isNull && "cursor-pointer hover:scale-105 hover:shadow-md"
                              )}
                              style={{
                                background: getColor(val),
                                color: getTextColor(val),
                              }}
                              onMouseEnter={(e) => {
                                if (!isNull) {
                                  setTooltip({
                                    cohort: row.cohort,
                                    column: cohortColumns[ci],
                                    value: val as number,
                                    users: Math.round(row.users * (val as number) / 100),
                                  });
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

          {/* Summary stats */}
          <div className="animate-fade-in-up stagger-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Avg Day-1 Retention", value: "100%", sub: "All cohorts" },
              { label: "Avg Day-7 Retention", value: "72%", sub: "7-day avg" },
              { label: "Avg Day-14 Retention", value: "57%", sub: "14-day avg" },
              { label: "Avg Day-30 Retention", value: "41%", sub: "30-day avg" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-border bg-card p-4 shadow-card">
                <div className="text-xs text-muted-foreground mb-1">{stat.label}</div>
                <div className="text-2xl font-bold text-primary">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{stat.sub}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Floating tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none rounded-lg border border-border bg-card shadow-elevated px-3 py-2 text-xs"
          style={{ top: tooltipPos.y - 80, left: tooltipPos.x - 60 }}
        >
          <div className="font-semibold text-foreground">{tooltip.cohort}</div>
          <div className="text-muted-foreground">{tooltip.column}</div>
          <div className="flex gap-3 mt-1">
            <span>Retention: <strong className="text-primary">{tooltip.value}%</strong></span>
            <span>Users: <strong className="text-foreground">{tooltip.users.toLocaleString()}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}
