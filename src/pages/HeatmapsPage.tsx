import { useState, useEffect } from "react";
import { MousePointerClick, ArrowDownUp, Eye, Sparkles, ChevronDown, Play, X as XIcon } from "lucide-react";
import { FilterBar } from "@/components/FilterBar";
import { SkeletonCard } from "@/components/SkeletonCard";
import { cn } from "@/lib/utils";

type HeatmapMode = "click" | "scroll" | "attention";

// Click hotspots positioned on the simulated page
const clickHotspots = [
  { id: 1, label: "Shop now", clicks: 523, pct: 33.2, top: 52, left: 18, radius: 55, intensity: 95 },
  { id: 2, label: "Bestsellers →", clicks: 312, pct: 19.8, top: 68, left: 82, radius: 40, intensity: 75 },
  { id: 3, label: "New In", clicks: 198, pct: 12.6, top: 8, left: 35, radius: 32, intensity: 58 },
  { id: 4, label: "Earrings", clicks: 156, pct: 9.9, top: 8, left: 48, radius: 28, intensity: 48 },
  { id: 5, label: "Necklaces", clicks: 134, pct: 8.5, top: 8, left: 58, radius: 25, intensity: 42 },
  { id: 6, label: "Bracelets", clicks: 98, pct: 6.2, top: 8, left: 68, radius: 22, intensity: 32 },
  { id: 7, label: "Shop new in →", clicks: 87, pct: 5.5, top: 68, left: 22, radius: 20, intensity: 28 },
  { id: 8, label: "Logo", clicks: 67, pct: 4.3, top: 8, left: 12, radius: 18, intensity: 22 },
];

// Attention zones
const attentionData = [
  { section: "Hero Banner", avgTime: "04:36", sessionPct: 10, top: 18, height: 48 },
  { section: "Navigation", avgTime: "01:12", sessionPct: 4, top: 0, height: 14 },
  { section: "Category Links", avgTime: "02:45", sessionPct: 8, top: 66, height: 10 },
  { section: "Product Grid", avgTime: "03:22", sessionPct: 12, top: 78, height: 22 },
];

export default function HeatmapsPage() {
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<HeatmapMode>("click");
  const [hoveredSpot, setHoveredSpot] = useState<number | null>(null);
  const [hoveredAttention, setHoveredAttention] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  const modes: { key: HeatmapMode; label: string; icon: typeof MousePointerClick; shortcut: string }[] = [
    { key: "click", label: "Click", icon: Play, shortcut: "▶" },
    { key: "scroll", label: "Scroll", icon: XIcon, shortcut: "✕" },
    { key: "attention", label: "Attention", icon: Eye, shortcut: "6ð" },
  ];

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up stagger-1">
        <FilterBar title="Heatmaps" subtitle="Visualize user interaction patterns across your pages" />
      </div>

      {/* Mode toggle — Clarity pill style */}
      <div className="animate-fade-in-up stagger-2">
        <div className="inline-flex items-center rounded-full border border-border bg-card p-1.5 shadow-elevated">
          {modes.map((m) => {
            const active = mode === m.key;
            return (
              <button
                key={m.key}
                onClick={() => setMode(m.key)}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200",
                  active
                    ? "bg-foreground text-background shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {m.key === "click" && <span className="text-xs">▶</span>}
                {m.key === "scroll" && <span className="text-xs">✕</span>}
                {m.key === "attention" && <span className="text-xs font-mono">6ð</span>}
                {m.label}
                {m.key === "click" && <ChevronDown className="h-3 w-3 opacity-50" />}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <SkeletonCard lines={12} />
      ) : (
        <>
          {/* Simulated Page Preview with Heatmap Overlay */}
          <div className="animate-fade-in-up stagger-3 rounded-2xl border border-border bg-card shadow-elevated overflow-hidden">
            {/* Simulated webpage */}
            <div className="relative select-none" style={{ minHeight: 520 }}>
              {/* Simulated page content */}
              <div className="relative">
                {/* Nav bar */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
                  <span className="text-sm font-bold text-primary">VanArsdel</span>
                  <div className="flex gap-6">
                    {["All Jewelry", "New In", "Earrings", "Necklaces", "Bracelets", "Rings"].map((item) => (
                      <span key={item} className="text-xs text-muted-foreground hover:text-foreground cursor-default">{item}</span>
                    ))}
                  </div>
                </div>

                {/* Hero section */}
                <div className="relative overflow-hidden" style={{ height: 280 }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-100 via-pink-100 to-purple-100" />
                  <div className="relative px-8 py-10 flex items-center">
                    <div className="flex-1">
                      <h2 className="text-3xl font-bold text-foreground leading-tight mb-2">
                        Annual Mother's Day<br />Sale
                      </h2>
                      <p className="text-sm text-muted-foreground mb-4">50% off all styles to treat your mom</p>
                      <button className="px-5 py-2.5 bg-foreground text-background text-sm font-semibold rounded-lg">
                        Shop now
                      </button>
                    </div>
                    <div className="w-48 h-48 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center">
                      <span className="text-6xl">💎</span>
                    </div>
                  </div>
                </div>

                {/* Category links */}
                <div className="grid grid-cols-3 gap-3 px-6 py-4">
                  {["Shop new in →", "Earrings →", "Bestsellers →"].map((cat) => (
                    <div key={cat} className="border border-border rounded-lg px-4 py-3 text-center">
                      <span className="text-xs text-muted-foreground">{cat}</span>
                    </div>
                  ))}
                </div>

                {/* Product grid */}
                <div className="grid grid-cols-3 gap-3 px-6 py-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="aspect-[4/3] rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 border border-border/50" />
                  ))}
                </div>
              </div>

              {/* ──── CLICK OVERLAY ──── */}
              {mode === "click" && (
                <div className="absolute inset-0 pointer-events-none">
                  {/* Heat blobs */}
                  {clickHotspots.map((spot) => (
                    <div
                      key={spot.id}
                      className="absolute pointer-events-auto cursor-pointer transition-transform duration-200"
                      style={{
                        top: `${spot.top}%`,
                        left: `${spot.left}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                      onMouseEnter={() => setHoveredSpot(spot.id)}
                      onMouseLeave={() => setHoveredSpot(null)}
                    >
                      {/* Radial heat blob */}
                      <div
                        className="rounded-full"
                        style={{
                          width: spot.radius * 2,
                          height: spot.radius * 2,
                          background: `radial-gradient(circle, 
                            hsla(0, 85%, 55%, ${spot.intensity / 120}) 0%, 
                            hsla(30, 90%, 50%, ${spot.intensity / 180}) 30%, 
                            hsla(120, 60%, 50%, ${spot.intensity / 300}) 60%, 
                            transparent 100%)`,
                          filter: "blur(8px)",
                        }}
                      />
                      {/* Numbered badge */}
                      <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-lg z-10"
                      >
                        {spot.id}
                      </div>

                      {/* Tooltip popup */}
                      {hoveredSpot === spot.id && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-30 pointer-events-none">
                          <div className="bg-card border border-border rounded-xl shadow-elevated p-4 min-w-[180px]">
                            <div className="text-xs text-muted-foreground mb-1">Clicks</div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-bold text-foreground">{spot.clicks.toLocaleString()}</span>
                              <span className="text-sm text-muted-foreground">({spot.pct}%)</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">{spot.label}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* ──── SCROLL OVERLAY ──── */}
              {mode === "scroll" && (
                <div className="absolute inset-0 pointer-events-none">
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(to bottom, 
                        hsla(210, 100%, 70%, 0.15) 0%,
                        hsla(210, 100%, 65%, 0.20) 10%,
                        hsla(30, 100%, 60%, 0.25) 40%,
                        hsla(45, 100%, 55%, 0.35) 55%,
                        hsla(50, 100%, 50%, 0.45) 70%,
                        hsla(55, 100%, 48%, 0.50) 85%,
                        hsla(60, 100%, 45%, 0.55) 100%
                      )`,
                    }}
                  />
                  {/* Scroll depth markers */}
                  {[
                    { pct: 50, reached: "85.31%", label: "of users reached this point" },
                    { pct: 75, reached: "62.4%", label: "of users reached this point" },
                    { pct: 92, reached: "34.7%", label: "of users reached this point" },
                  ].map((marker) => (
                    <div
                      key={marker.pct}
                      className="absolute left-0 right-0 flex items-center justify-center"
                      style={{ top: `${marker.pct}%` }}
                    >
                      <div className="w-full border-t-2 border-dashed border-foreground/30 relative">
                        <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2">
                          <div className="bg-card/95 backdrop-blur border border-border rounded-lg shadow-elevated px-4 py-2 flex items-center gap-2">
                            <span className="text-lg font-bold text-foreground">{marker.reached}</span>
                            <span className="text-xs text-muted-foreground">{marker.label}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ──── ATTENTION OVERLAY ──── */}
              {mode === "attention" && (
                <div className="absolute inset-0 pointer-events-none">
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(to bottom,
                        hsla(0, 80%, 55%, 0.20) 0%,
                        hsla(0, 70%, 60%, 0.30) 15%,
                        hsla(350, 65%, 55%, 0.25) 30%,
                        hsla(340, 60%, 60%, 0.20) 50%,
                        hsla(180, 50%, 55%, 0.15) 70%,
                        hsla(175, 55%, 50%, 0.25) 85%,
                        hsla(170, 60%, 48%, 0.30) 100%
                      )`,
                    }}
                  />
                  {/* Horizontal attention line */}
                  <div className="absolute left-0 right-0 border-t-2 border-red-400/60" style={{ top: "22%" }} />
                  <div className="absolute left-0 right-0 border-t-2 border-red-400/40" style={{ top: "65%" }} />

                  {/* Attention tooltip zone */}
                  {attentionData.map((zone, i) => (
                    <div
                      key={i}
                      className="absolute left-0 right-0 pointer-events-auto cursor-pointer"
                      style={{ top: `${zone.top}%`, height: `${zone.height}%` }}
                      onMouseEnter={() => setHoveredAttention(i)}
                      onMouseLeave={() => setHoveredAttention(null)}
                    >
                      {hoveredAttention === i && (
                        <div className="absolute right-8 top-1/2 -translate-y-1/2 z-30">
                          <div className="bg-card border border-border rounded-xl shadow-elevated p-4 min-w-[200px]">
                            <div className="text-xs text-muted-foreground mb-2">{zone.section}</div>
                            <div>
                              <div className="text-xs text-muted-foreground">Avg time spent</div>
                              <div className="text-3xl font-bold text-foreground tracking-tight">{zone.avgTime}</div>
                            </div>
                            <div className="mt-3">
                              <div className="text-xs text-muted-foreground">% of session length</div>
                              <div className="text-3xl font-bold text-foreground tracking-tight">{zone.sessionPct}%</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Heatmap Insights — Clarity style */}
          <div className="animate-fade-in-up stagger-4 rounded-xl border border-border bg-card shadow-card overflow-hidden">
            <div className="px-6 py-5 flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-primary mb-1.5">Heatmap insights</h3>
                <p className="text-sm text-foreground leading-relaxed">
                  {mode === "click" && "Desktop users focused on early-page content, but mobile users dropped off quickly. Adjust key elements for a more mobile-friendly experience."}
                  {mode === "scroll" && "85% of users scroll past the hero fold. Consider placing key CTAs above the 50% scroll mark where engagement drops significantly."}
                  {mode === "attention" && "Users spend the most time on the Hero Banner (avg 4:36). Content below the fold receives significantly less attention — consider restructuring."}
                </p>
              </div>
            </div>
          </div>

          {/* Click mode: Top elements list */}
          {mode === "click" && (
            <div className="animate-fade-in-up stagger-5 rounded-xl border border-border bg-card shadow-card overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">Top Clicked Elements</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Ranked by total click volume</p>
              </div>
              <div className="divide-y divide-border">
                {[...clickHotspots].sort((a, b) => b.clicks - a.clicks).map((spot, i) => (
                  <div key={spot.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-muted/30 transition-colors">
                    <span className="flex items-center justify-center h-7 w-7 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-foreground flex-1">{spot.label}</span>
                    <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary/80 transition-all duration-500"
                        style={{ width: `${(spot.clicks / clickHotspots[0].clicks) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-foreground w-14 text-right">{spot.clicks}</span>
                    <span className="text-xs text-muted-foreground w-14 text-right">{spot.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scroll mode: stats */}
          {mode === "scroll" && (
            <div className="animate-fade-in grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Avg. Scroll Depth", value: "62%", sub: "of total page" },
                { label: "Fold Reach Rate", value: "85.3%", sub: "users past 50%" },
                { label: "Bottom Reach", value: "24.8%", sub: "users to footer" },
                { label: "Avg. Scroll Speed", value: "1.2s", sub: "per viewport" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-border bg-card p-5 shadow-card">
                  <div className="text-xs text-muted-foreground mb-1.5">{stat.label}</div>
                  <div className="text-2xl font-bold text-primary">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.sub}</div>
                </div>
              ))}
            </div>
          )}

          {/* Attention mode: breakdown */}
          {mode === "attention" && (
            <div className="animate-fade-in rounded-xl border border-border bg-card shadow-card overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">Section Engagement Breakdown</h3>
              </div>
              <div className="divide-y divide-border">
                {attentionData.map((zone) => (
                  <div key={zone.section} className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center">
                        <Eye className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{zone.section}</span>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Avg time</div>
                        <div className="text-base font-bold text-foreground">{zone.avgTime}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Session %</div>
                        <div className="text-base font-bold text-primary">{zone.sessionPct}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
