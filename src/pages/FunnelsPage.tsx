import { useState, useEffect } from "react";
import { FilterBar } from "@/components/FilterBar";
import { SkeletonCard } from "@/components/SkeletonCard";
import { funnelStages } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

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
    <div className="rounded-xl border border-border bg-card shadow-elevated p-4 text-xs space-y-1.5 min-w-[200px]">
      <div className="font-semibold text-foreground text-sm">{stage.name}</div>
      <div className="flex justify-between gap-4 text-muted-foreground">
        <span>Users</span>
        <span className="font-mono text-foreground font-bold">{stage.value.toLocaleString()}</span>
      </div>
      <div className="flex justify-between gap-4 text-muted-foreground">
        <span>% of top</span>
        <span className="font-mono text-foreground font-bold">{pctOfTop}%</span>
      </div>
      {dropoff && (
        <div className="flex justify-between gap-4 text-muted-foreground border-t border-border pt-1.5 mt-1.5">
          <span>Drop-off → next</span>
          <span className="font-mono text-destructive font-bold">-{dropoff}%</span>
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
        <div className="animate-fade-in-up stagger-2 rounded-2xl border border-border bg-card p-8 shadow-card">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-base font-semibold text-foreground">Visitor → Active User</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Overall conversion: <span className="font-bold text-primary">{((funnelStages[4].value / maxVal) * 100).toFixed(1)}%</span>
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Active Users</div>
              <div className="text-2xl font-bold text-primary">{funnelStages[4].value.toLocaleString()}</div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-0 select-none">
            {funnelStages.map((stage, i) => {
              const pct = (stage.value / maxVal) * 100;
              const next = funnelStages[i + 1];
              const dropoff = next
                ? (((stage.value - next.value) / stage.value) * 100).toFixed(1)
                : null;

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
                        "w-full h-16 rounded-xl flex items-center justify-between px-5 transition-all duration-200",
                        hovered === i ? "scale-[1.015] shadow-md" : ""
                      )}
                      style={{ backgroundColor: `hsl(158, ${64 - i * 4}%, ${35 + i * 5}%)` }}
                    >
                      <span className="text-sm font-bold text-white">{stage.name}</span>
                      <div className="text-right">
                        <div className="text-sm font-bold text-white tabular-nums">{stage.value.toLocaleString()}</div>
                        <div className="text-xs text-white/70">{pct.toFixed(1)}%</div>
                      </div>
                    </div>
                    {hovered === i && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full ml-3 z-20 pl-3">
                        <FunnelTooltip stage={stage} next={next} index={i} />
                      </div>
                    )}
                  </div>
                  {dropoff && (
                    <div className="flex items-center gap-2 my-2">
                      <div className="h-5 w-px bg-border" />
                      <span className="text-[11px] text-destructive font-semibold bg-destructive/8 border border-destructive/20 rounded-full px-2.5 py-0.5">
                        ↓ {dropoff}% drop-off
                      </span>
                      <div className="h-5 w-px bg-border" />
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
        <div className="animate-fade-in-up stagger-3 rounded-2xl border border-border bg-card shadow-card overflow-hidden">
          <div className="px-6 py-5 border-b border-border flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">Stage Summary</h3>
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
                  <th className="text-right px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Drop-off</th>
                </tr>
              </thead>
              <tbody>
                {funnelStages.map((stage, i) => {
                  const next = funnelStages[i + 1];
                  return (
                    <tr key={stage.name} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 text-foreground font-medium">{stage.name}</td>
                      <td className="px-6 py-4 text-right font-mono text-foreground font-semibold">{stage.value.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right text-foreground">
                        {((stage.value / maxVal) * 100).toFixed(1)}%
                      </td>
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
      )}
    </div>
  );
}
