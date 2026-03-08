import { useState, useEffect, useCallback } from "react";
import { MousePointerClick, ArrowDownUp, Eye, Sparkles, Info } from "lucide-react";
import { FilterBar } from "@/components/FilterBar";
import { SkeletonCard } from "@/components/SkeletonCard";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type HeatmapMode = "click" | "scroll" | "attention";

// Mock click zones data — grid cells with click counts
const clickZones = [
  { id: 1, label: "Hero CTA", clicks: 1842, pct: 33.2, row: 1, col: 1, intensity: 95 },
  { id: 2, label: "Nav Menu", clicks: 1204, pct: 21.7, row: 0, col: 2, intensity: 78 },
  { id: 3, label: "Product Card 1", clicks: 876, pct: 15.8, row: 3, col: 0, intensity: 62 },
  { id: 4, label: "Search Bar", clicks: 654, pct: 11.8, row: 0, col: 1, intensity: 50 },
  { id: 5, label: "Footer Link", clicks: 432, pct: 7.8, row: 5, col: 1, intensity: 35 },
  { id: 6, label: "Banner Close", clicks: 298, pct: 5.4, row: 1, col: 3, intensity: 25 },
  { id: 7, label: "Product Card 2", clicks: 187, pct: 3.4, row: 3, col: 1, intensity: 18 },
  { id: 8, label: "Social Icons", clicks: 52, pct: 0.9, row: 5, col: 3, intensity: 8 },
];

// Mock scroll depth data
const scrollDepths = [
  { depth: "0%", reached: 100, color: "hsl(158, 64%, 35%)" },
  { depth: "10%", reached: 97.2, color: "hsl(158, 60%, 38%)" },
  { depth: "25%", reached: 91.5, color: "hsl(152, 56%, 45%)" },
  { depth: "50%", reached: 85.3, color: "hsl(45, 90%, 50%)" },
  { depth: "60%", reached: 72.1, color: "hsl(30, 85%, 52%)" },
  { depth: "75%", reached: 58.4, color: "hsl(15, 80%, 55%)" },
  { depth: "85%", reached: 41.2, color: "hsl(0, 75%, 55%)" },
  { depth: "100%", reached: 24.8, color: "hsl(0, 70%, 45%)" },
];

// Mock attention zones
const attentionZones = [
  { id: 1, label: "Hero Section", avgTime: "04:36", sessionPct: 32, intensity: 95 },
  { id: 2, label: "Product Grid", avgTime: "03:12", sessionPct: 24, intensity: 78 },
  { id: 3, label: "Navigation Bar", avgTime: "01:45", sessionPct: 12, intensity: 55 },
  { id: 4, label: "Testimonials", avgTime: "02:08", sessionPct: 16, intensity: 62 },
  { id: 5, label: "Pricing Table", avgTime: "01:22", sessionPct: 10, intensity: 42 },
  { id: 6, label: "Footer", avgTime: "00:34", sessionPct: 6, intensity: 15 },
];

// Page section labels for the grid
const pageRows = ["Navigation", "Hero Banner", "Sub Navigation", "Product Grid", "Content Area", "Footer"];
const pageCols = ["Left Sidebar", "Main Content", "Right Panel", "Actions"];

function getHeatColor(intensity: number): string {
  if (intensity >= 90) return "hsla(0, 85%, 55%, 0.85)";
  if (intensity >= 70) return "hsla(15, 80%, 52%, 0.75)";
  if (intensity >= 50) return "hsla(38, 92%, 50%, 0.65)";
  if (intensity >= 30) return "hsla(52, 88%, 55%, 0.50)";
  if (intensity >= 15) return "hsla(100, 60%, 50%, 0.35)";
  return "hsla(158, 64%, 45%, 0.20)";
}

function getScrollGradient(): string {
  return `linear-gradient(to bottom, 
    hsla(158, 64%, 35%, 0.25) 0%, 
    hsla(152, 56%, 45%, 0.30) 25%, 
    hsla(45, 90%, 50%, 0.40) 50%, 
    hsla(15, 80%, 55%, 0.55) 75%, 
    hsla(0, 70%, 45%, 0.70) 100%)`;
}

export default function HeatmapsPage() {
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<HeatmapMode>("click");
  const [hoveredZone, setHoveredZone] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  const totalClicks = clickZones.reduce((s, z) => s + z.clicks, 0);

  const modes: { key: HeatmapMode; label: string; icon: typeof MousePointerClick }[] = [
    { key: "click", label: "Click", icon: MousePointerClick },
    { key: "scroll", label: "Scroll", icon: ArrowDownUp },
    { key: "attention", label: "Attention", icon: Eye },
  ];

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up stagger-1">
        <FilterBar title="Heatmaps" subtitle="Visualize user interaction patterns across your pages" />
      </div>

      {/* Mode toggle — Clarity style */}
      <div className="animate-fade-in-up stagger-2">
        <div className="inline-flex items-center rounded-full border border-border bg-card p-1 shadow-card">
          {modes.map((m) => {
            const Icon = m.icon;
            const active = mode === m.key;
            return (
              <button
                key={m.key}
                onClick={() => setMode(m.key)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-4 w-4" />
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <SkeletonCard lines={10} />
      ) : (
        <>
          {/* Click Heatmap */}
          {mode === "click" && (
            <div className="space-y-4 animate-fade-in">
              {/* Grid heatmap */}
              <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Click Density Map</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {totalClicks.toLocaleString()} total clicks tracked · Page zone analysis
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground">Low</span>
                    <div className="flex gap-0.5">
                      {["hsla(158, 64%, 45%, 0.20)", "hsla(100, 60%, 50%, 0.35)", "hsla(52, 88%, 55%, 0.50)", "hsla(38, 92%, 50%, 0.65)", "hsla(15, 80%, 52%, 0.75)", "hsla(0, 85%, 55%, 0.85)"].map((c, i) => (
                        <div key={i} className="w-5 h-3 rounded-sm" style={{ background: c }} />
                      ))}
                    </div>
                    <span className="text-[10px] text-muted-foreground">High</span>
                  </div>
                </div>

                <div className="p-5">
                  {/* Grid */}
                  <div className="grid grid-cols-4 gap-1.5">
                    {pageRows.map((row, ri) => (
                      pageCols.map((col, ci) => {
                        const zone = clickZones.find(z => z.row === ri && z.col === ci);
                        const isHovered = zone && hoveredZone === zone.id;
                        return (
                          <Tooltip key={`${ri}-${ci}`}>
                            <TooltipTrigger asChild>
                              <div
                                className={cn(
                                  "relative rounded-lg border border-border/50 h-20 flex flex-col items-center justify-center cursor-pointer transition-all duration-200",
                                  isHovered && "ring-2 ring-primary/40 scale-[1.02]",
                                  !zone && "bg-muted/30"
                                )}
                                style={{
                                  background: zone ? getHeatColor(zone.intensity) : undefined,
                                }}
                                onMouseEnter={() => zone && setHoveredZone(zone.id)}
                                onMouseLeave={() => setHoveredZone(null)}
                              >
                                {zone && (
                                  <>
                                    <div className="absolute top-1.5 left-2">
                                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold shadow-sm">
                                        {zone.id}
                                      </span>
                                    </div>
                                    <span className="text-xs font-semibold text-foreground/90 mt-1">{zone.label}</span>
                                    <span className="text-[11px] text-foreground/70 font-medium">{zone.clicks.toLocaleString()} clicks</span>
                                  </>
                                )}
                                {!zone && (
                                  <span className="text-[10px] text-muted-foreground/50">{row} · {col}</span>
                                )}
                              </div>
                            </TooltipTrigger>
                            {zone && (
                              <TooltipContent side="top" className="p-3">
                                <div className="space-y-1">
                                  <div className="text-xs font-semibold">{zone.label}</div>
                                  <div className="text-xs text-muted-foreground">{row} → {col}</div>
                                  <div className="flex gap-3 mt-1">
                                    <span className="text-xs">Clicks: <strong className="text-primary">{zone.clicks.toLocaleString()}</strong></span>
                                    <span className="text-xs">Share: <strong className="text-foreground">{zone.pct}%</strong></span>
                                  </div>
                                </div>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        );
                      })
                    ))}
                  </div>
                </div>
              </div>

              {/* Top clicked elements */}
              <div className="rounded-xl border border-border bg-card p-5 shadow-card">
                <h3 className="text-sm font-semibold text-foreground mb-3">Top Clicked Elements</h3>
                <div className="space-y-2.5">
                  {clickZones.sort((a, b) => b.clicks - a.clicks).map((zone, i) => {
                    const pct = Math.round((zone.clicks / clickZones[0].clicks) * 100);
                    return (
                      <div key={zone.id} className="flex items-center gap-3">
                        <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-[10px] font-bold shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-xs font-medium text-foreground w-32 shrink-0 truncate">{zone.label}</span>
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: getHeatColor(zone.intensity) }} />
                        </div>
                        <span className="text-xs font-semibold text-foreground w-16 text-right shrink-0">{zone.clicks.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground w-12 text-right shrink-0">{zone.pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Scroll Heatmap */}
          {mode === "scroll" && (
            <div className="space-y-4 animate-fade-in">
              <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                  <h3 className="text-sm font-semibold text-foreground">Scroll Depth Analysis</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Percentage of users who reached each scroll depth</p>
                </div>
                <div className="p-5">
                  {/* Visual scroll representation */}
                  <div className="relative rounded-xl border border-border overflow-hidden" style={{ height: 420 }}>
                    <div className="absolute inset-0" style={{ background: getScrollGradient() }} />
                    {scrollDepths.map((s, i) => {
                      const topPct = (i / (scrollDepths.length - 1)) * 100;
                      return (
                        <div
                          key={s.depth}
                          className="absolute left-0 right-0 flex items-center px-4"
                          style={{ top: `${topPct}%` }}
                        >
                          <div className="w-full border-t border-dashed border-foreground/20 relative">
                            <div className="absolute -top-3 left-3 flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-foreground bg-card/90 backdrop-blur px-2 py-0.5 rounded shadow-sm border border-border">
                                {s.reached}%
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                of users reached this point
                              </span>
                            </div>
                            <div className="absolute -top-3 right-3">
                              <span className="text-[11px] font-medium text-foreground/70 bg-card/90 backdrop-blur px-2 py-0.5 rounded shadow-sm border border-border">
                                {s.depth} scroll
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Scroll stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Avg. Scroll Depth", value: "62%", sub: "of total page" },
                  { label: "Fold Reach Rate", value: "85.3%", sub: "users past 50%" },
                  { label: "Bottom Reach", value: "24.8%", sub: "users to footer" },
                  { label: "Avg. Scroll Speed", value: "1.2s", sub: "per viewport" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-border bg-card p-4 shadow-card">
                    <div className="text-xs text-muted-foreground mb-1">{stat.label}</div>
                    <div className="text-2xl font-bold text-primary">{stat.value}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{stat.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attention Heatmap */}
          {mode === "attention" && (
            <div className="space-y-4 animate-fade-in">
              <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                  <h3 className="text-sm font-semibold text-foreground">Attention Analysis</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Average time spent and engagement per page section</p>
                </div>
                <div className="p-5 space-y-3">
                  {attentionZones.map((zone) => (
                    <div
                      key={zone.id}
                      className="relative rounded-xl border border-border overflow-hidden transition-all duration-200 hover:shadow-md"
                    >
                      {/* Background intensity bar */}
                      <div
                        className="absolute inset-0 opacity-20"
                        style={{ 
                          background: `linear-gradient(90deg, ${getHeatColor(zone.intensity)} ${zone.sessionPct * 3}%, transparent)` 
                        }}
                      />
                      <div className="relative px-5 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                            <Eye className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-foreground">{zone.label}</div>
                            <div className="text-xs text-muted-foreground">Section #{zone.id}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground">Avg time spent</div>
                            <div className="text-lg font-bold text-foreground">{zone.avgTime}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground">% of session</div>
                            <div className="text-lg font-bold text-primary">{zone.sessionPct}%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Heatmap insights card */}
          <div className="animate-fade-in-up stagger-4 rounded-xl border border-border bg-card shadow-card overflow-hidden">
            <div className="px-5 py-4 flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-primary mb-1">Heatmap Insights</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {mode === "click" && "Desktop users focused on the Hero CTA and Navigation elements. Consider making secondary CTAs more prominent to distribute engagement."}
                  {mode === "scroll" && "Desktop users focused on early-page content, but mobile users dropped off quickly. Adjust key elements for a more mobile-friendly experience."}
                  {mode === "attention" && "Users spend the most time on the Hero Section and Product Grid. Consider optimizing below-fold content to retain attention longer."}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
