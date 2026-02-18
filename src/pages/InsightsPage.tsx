import { useState, useEffect } from "react";
import { Lightbulb, TrendingUp, TrendingDown, Minus, RefreshCw, Sparkles } from "lucide-react";
import { FilterBar } from "@/components/FilterBar";
import { SkeletonCard } from "@/components/SkeletonCard";
import { insights } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export default function InsightsPage() {
  const [loading, setLoading] = useState(true);
  const [highlighted, setHighlighted] = useState<number>(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  // Auto-rotate highlight
  useEffect(() => {
    if (loading) return;
    const interval = setInterval(() => {
      setHighlighted((h) => (h + 1) % insights.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [loading]);

  const handleRefreshInsights = () => {
    setRefreshing(true);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setRefreshing(false);
      toast({ title: "Insights refreshed", description: "AI analysis updated." });
    }, 900);
  };

  const typeConfig = {
    positive: {
      icon: TrendingUp,
      border: "border-l-primary",
      iconColor: "text-primary",
      bg: "bg-accent/50",
      badge: "bg-accent text-accent-foreground",
    },
    negative: {
      icon: TrendingDown,
      border: "border-l-destructive",
      iconColor: "text-destructive",
      bg: "bg-destructive/5",
      badge: "bg-destructive/10 text-destructive",
    },
    neutral: {
      icon: Minus,
      border: "border-l-warning",
      iconColor: "text-warning",
      bg: "bg-warning/5",
      badge: "bg-warning/10 text-warning",
    },
  };

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up stagger-1">
        <FilterBar title="Smart Insights" subtitle="AI-generated analysis of your analytics data" />
      </div>

      {/* Header card */}
      <div className="animate-fade-in-up stagger-2 rounded-xl border border-border bg-card shadow-card overflow-hidden">
        <div className="bg-gradient-to-r from-primary/8 via-accent/20 to-transparent px-6 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">AI Insight Engine</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {insights.length} insights generated from your data · Auto-rotates every 3.5s
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5 shrink-0"
            onClick={handleRefreshInsights}
          >
            <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Insights list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} lines={2} showHeader={false} />)}
        </div>
      ) : (
        <div className="space-y-3">
          {insights.map((insight, i) => {
            const config = typeConfig[insight.type as keyof typeof typeConfig];
            const Icon = config.icon;
            const isHighlighted = highlighted === i;

            return (
              <div
                key={insight.id}
                className={cn(
                  "animate-fade-in-up rounded-xl border border-border bg-card shadow-card overflow-hidden border-l-4 transition-all duration-500 cursor-default",
                  config.border,
                  isHighlighted && "shadow-elevated scale-[1.005]",
                  `stagger-${i + 1}`
                )}
                onClick={() => setHighlighted(i)}
              >
                <div className={cn("px-5 py-4 flex items-start gap-4", isHighlighted && config.bg)}>
                  <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5", isHighlighted ? "bg-card" : "bg-muted")}>
                    {isHighlighted ? (
                      <Lightbulb className={cn("h-4 w-4", config.iconColor)} />
                    ) : (
                      <Icon className={cn("h-4 w-4", config.iconColor)} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", config.badge)}>
                        {insight.tag}
                      </span>
                      {isHighlighted && (
                        <span className="text-[11px] text-primary font-medium animate-fade-in">
                          ✦ Featured
                        </span>
                      )}
                    </div>
                    <p className={cn(
                      "text-sm leading-relaxed transition-colors duration-300",
                      isHighlighted ? "text-foreground font-medium" : "text-muted-foreground"
                    )}>
                      {insight.text}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Metrics summary */}
      {!loading && (
        <div className="animate-fade-in-up stagger-6 grid grid-cols-3 gap-4">
          {[
            { label: "Positive Signals", value: insights.filter(i => i.type === "positive").length, color: "text-primary" },
            { label: "Neutral Notes", value: insights.filter(i => i.type === "neutral").length, color: "text-warning" },
            { label: "Alerts", value: insights.filter(i => i.type === "negative").length, color: "text-destructive" },
          ].map((m) => (
            <div key={m.label} className="rounded-xl border border-border bg-card p-4 shadow-card text-center">
              <div className={cn("text-3xl font-bold mb-1", m.color)}>{m.value}</div>
              <div className="text-xs text-muted-foreground">{m.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
