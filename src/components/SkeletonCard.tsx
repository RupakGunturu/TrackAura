import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  className?: string;
  lines?: number;
  showHeader?: boolean;
}

export function SkeletonCard({ className, lines = 3, showHeader = true }: SkeletonCardProps) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-5 shadow-card", className)}>
      {showHeader && (
        <div className="mb-4 flex items-center gap-3">
          <div className="h-4 w-24 rounded skeleton-shimmer" />
          <div className="h-3 w-16 rounded skeleton-shimmer ml-auto" />
        </div>
      )}
      <div className="space-y-2.5">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-3 rounded skeleton-shimmer",
              i === 0 && "w-full",
              i === 1 && "w-4/5",
              i === 2 && "w-3/5",
              i === 3 && "w-2/3",
            )}
          />
        ))}
      </div>
    </div>
  );
}

export function SkeletonKpiCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <div className="h-3 w-20 rounded skeleton-shimmer" />
        <div className="h-6 w-6 rounded skeleton-shimmer" />
      </div>
      <div className="h-8 w-28 rounded skeleton-shimmer mb-2" />
      <div className="h-3 w-16 rounded skeleton-shimmer" />
    </div>
  );
}
