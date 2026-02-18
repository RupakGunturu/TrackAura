import { useState, useEffect } from "react";
import { Tooltip, ResponsiveContainer } from "recharts";
import { FilterBar } from "@/components/FilterBar";
import { SkeletonCard } from "@/components/SkeletonCard";
import { funnelStages } from "@/lib/mockData";
import { cn } from "@/lib/utils";

interface FunnelTooltipProps {
  stage: typeof funnelStages[0];
  next?: typeof funnelStages[0];
  index: number;
}

function FunnelTooltip({ stage, next, index }: FunnelTooltipProps) {
  const pctOfTop = ((stage.value / funnelStages[0].value) * 100).toFixed(1);
  const dropoff = next
    ? (((stage.value - next.value) / stage.value) * 100).toFixed(1)
    : null;

  return (
    <div className="rounded-lg border border-border bg-card shadow-elevated p-3 text-xs space-y-1 min-w-[180px]">
      <div className="font-semibold text-foreground">{stage.name}</div>
      <div className="flex justify-between gap-4 text-muted-foreground">
        <span>Users</span>
        <span className="font-mono text-foreground font-medium">{stage.value.toLocaleString()}</span>
      </div>
      <div className="flex justify-between gap-4 text-muted-foreground">
        <span>% of top</span>
        <span className="font-mono text-foreground font-medium">{pctOfTop}%</span>
      </div>
      {dropoff && (
        <div className="flex justify-between gap-4 text-muted-foreground border-t border-border pt-1 mt-1">
          <span>Drop-off →next</span>
          <span className="font-mono text-destructive font-medium">-{dropoff}%</span>
        </div>
      )}
    </div>
  );
}

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
        <SkeletonCard lines={8} />
      ) : (
        <div className="animate-fade-in-up stagger-2 rounded-xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Visitor → Active User</h3>
              <p className="text-xs text-muted-foreground">Overall conversion: {((funnelStages[4].value / maxVal) * 100).toFixed(1)}%</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Active Users</div>
              <div className="text-lg font-bold text-primary">{funnelStages[4].value.toLocaleString()}</div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-0 select-none">
            {funnelStages.map((stage, i) => {
              const pct = (stage.value / maxVal) * 100;
              const next = funnelStages[i + 1];
              const dropoff = next
                ? (((stage.value - next.value) / stage.value) * 100).toFixed(1)
                : null;
              // Color intensity based on position
              const opacity = 1 - i * 0.13;

              return (
                <div key={stage.name} className="w-full flex flex-col items-center">
                  {/* Funnel bar */}
                  <div
                    className="relative w-full flex justify-center cursor-pointer group"
                    style={{ paddingLeft: `${(100 - pct) / 2}%`, paddingRight: `${(100 - pct) / 2}%` }}
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <div
                      className={cn(
                        "w-full h-14 rounded-lg flex items-center justify-between px-4 transition-all duration-200",
                        hovered === i ? "opacity-90 scale-[1.01]" : ""
                      )}
                      style={{ background: `hsl(158,64%,${35 + i * 5}%,${opacity})`, backgroundColor: `hsl(158, ${64 - i * 4}%, ${35 + i * 4}%)` }}
                    >
                      <span className="text-sm font-semibold text-white">{stage.name}</span>
                      <div className="text-right">
                        <div className="text-sm font-bold text-white">{stage.value.toLocaleString()}</div>
                        <div className="text-xs text-white/70">{pct.toFixed(1)}%</div>
                      </div>
                    </div>
                    {/* Tooltip */}
                    {hovered === i && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full ml-3 z-20 pl-3">
                        <FunnelTooltip stage={stage} next={next} index={i} />
                      </div>
                    )}
                  </div>

                  {/* Drop-off indicator */}
                  {dropoff && (
                    <div className="flex items-center gap-2 my-1.5">
                      <div className="h-4 w-px bg-border" />
                      <span className="text-[11px] text-destructive font-medium bg-destructive/8 border border-destructive/20 rounded px-1.5 py-0.5">
                        ↓ {dropoff}% drop-off
                      </span>
                      <div className="h-4 w-px bg-border" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary table */}
      {!loading && (
        <div className="animate-fade-in-up stagger-3 rounded-xl border border-border bg-card shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Stage Summary</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Stage</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Users</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">% of Top</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Drop-off</th>
                </tr>
              </thead>
              <tbody>
                {funnelStages.map((stage, i) => {
                  const next = funnelStages[i + 1];
                  return (
                    <tr key={stage.name} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3 text-foreground font-medium">{stage.name}</td>
                      <td className="px-5 py-3 text-right font-mono text-foreground">{stage.value.toLocaleString()}</td>
                      <td className="px-5 py-3 text-right text-foreground">
                        {((stage.value / maxVal) * 100).toFixed(1)}%
                      </td>
                      <td className="px-5 py-3 text-right">
                        {next ? (
                          <span className="text-destructive font-medium">
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
      )}
    </div>
  );
}
