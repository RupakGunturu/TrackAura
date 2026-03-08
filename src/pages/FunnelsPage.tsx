import { useState, useEffect } from "react";
import { FilterBar } from "@/components/FilterBar";
import { SkeletonCard } from "@/components/SkeletonCard";
import { funnelStages } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { ArrowUpRight, TrendingDown, ArrowRight, Zap, Target, Eye, MousePointerClick } from "lucide-react";

const stageIcons = [Eye, MousePointerClick, Zap, Target, ArrowUpRight];

export default function FunnelsPage() {
  const [loading, setLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState<number | null>(null);

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
              <div key={stat.label} className="rounded-2xl border border-border bg-card p-5 shadow-card hover:shadow-elevated hover:border-primary/20 transition-all duration-300">
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

          {/* New waterfall-style funnel visualization */}
          <div className="animate-fade-in-up stagger-3 rounded-2xl border border-border bg-card shadow-card overflow-hidden">
            <div className="px-8 py-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Conversion Flow</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Click any stage to view details</p>
            </div>
            <div className="p-8">
              {/* Horizontal pipeline */}
              <div className="flex items-stretch gap-0 overflow-x-auto pb-4">
                {funnelStages.map((stage, i) => {
                  const pct = (stage.value / maxVal) * 100;
                  const next = funnelStages[i + 1];
                  const dropoff = next ? ((stage.value - next.value) / stage.value * 100).toFixed(1) : null;
                  const convRate = next ? ((next.value / stage.value) * 100).toFixed(1) : null;
                  const Icon = stageIcons[i] || Target;
                  const isSelected = selectedStage === i;

                  return (
                    <div key={stage.name} className="flex items-stretch pt-4">
                      {/* Stage card */}
                      <button
                        onClick={() => setSelectedStage(isSelected ? null : i)}
                        className={cn(
                          "relative flex flex-col items-center justify-between p-5 rounded-2xl border-2 transition-all duration-300 min-w-[160px] text-left group overflow-visible",
                          isSelected
                            ? "border-primary bg-accent shadow-elevated scale-[1.03]"
                            : "border-border bg-card hover:border-primary/30 hover:shadow-card"
                        )}
                      >
                        {/* Stage number badge - positioned outside card */}
                        <div className={cn(
                          "absolute -top-3.5 left-1/2 -translate-x-1/2 h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-bold shadow-sm border-2 border-card z-10",
                          isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        )}>
                          {i + 1}
                        </div>

                        {/* Icon */}
                        <div className={cn(
                          "h-12 w-12 rounded-xl flex items-center justify-center mb-3 transition-colors",
                          isSelected ? "bg-primary/15" : "bg-muted group-hover:bg-accent"
                        )}>
                          <Icon className={cn("h-5 w-5", isSelected ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />
                        </div>

                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{stage.name}</div>
                        <div className="text-2xl font-bold text-foreground tracking-tight">{stage.value.toLocaleString()}</div>

                        {/* Percentage bar */}
                        <div className="w-full mt-3">
                          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-700"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className="text-[10px] text-muted-foreground font-semibold mt-1 text-center">{pct.toFixed(1)}%</div>
                        </div>
                      </button>

                      {/* Arrow connector with drop-off */}
                      {dropoff && (
                        <div className="flex flex-col items-center justify-center px-3 min-w-[80px]">
                          <div className="text-[10px] font-bold text-primary mb-1">{convRate}%</div>
                          <div className="flex items-center gap-1">
                            <div className="h-px w-6 bg-border" />
                            <ArrowRight className="h-4 w-4 text-primary" />
                            <div className="h-px w-6 bg-border" />
                          </div>
                          <div className="flex items-center gap-0.5 mt-1">
                            <TrendingDown className="h-2.5 w-2.5 text-destructive" />
                            <span className="text-[10px] font-semibold text-destructive">{dropoff}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Selected stage details */}
          {selectedStage !== null && (
            <div className="animate-fade-in-up rounded-2xl border border-primary/20 bg-accent/30 p-6 shadow-card">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center">
                  {(() => { const Icon = stageIcons[selectedStage] || Target; return <Icon className="h-5 w-5 text-primary" />; })()}
                </div>
                <div>
                  <h4 className="text-base font-semibold text-foreground">{funnelStages[selectedStage].name} — Stage {selectedStage + 1}</h4>
                  <p className="text-xs text-muted-foreground">{funnelStages[selectedStage].value.toLocaleString()} users reached this stage</p>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-border bg-card">
                  <div className="text-xs text-muted-foreground mb-1">From Previous</div>
                  <div className="text-lg font-bold text-foreground">
                    {selectedStage > 0
                      ? `${((funnelStages[selectedStage].value / funnelStages[selectedStage - 1].value) * 100).toFixed(1)}%`
                      : "—"}
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-border bg-card">
                  <div className="text-xs text-muted-foreground mb-1">From Top of Funnel</div>
                  <div className="text-lg font-bold text-primary">
                    {((funnelStages[selectedStage].value / maxVal) * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-border bg-card">
                  <div className="text-xs text-muted-foreground mb-1">Users Lost</div>
                  <div className="text-lg font-bold text-destructive">
                    {selectedStage > 0
                      ? (funnelStages[selectedStage - 1].value - funnelStages[selectedStage].value).toLocaleString()
                      : "0"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stage breakdown table */}
          <div className="animate-fade-in-up stagger-5 rounded-2xl border border-border bg-card shadow-card overflow-hidden">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">Stage Breakdown</h3>
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
                          <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
                            {(() => { const Icon = stageIcons[i] || Target; return <Icon className="h-3.5 w-3.5 text-primary" />; })()}
                          </div>
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
