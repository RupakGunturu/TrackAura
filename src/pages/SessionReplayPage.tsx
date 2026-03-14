import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Play, Pause, SkipForward, SkipBack, Monitor, Smartphone, Tablet, Clock, Search } from "lucide-react";
import { FilterBar } from "@/components/FilterBar";
import { SkeletonCard } from "@/components/SkeletonCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getDateRangeBounds,
  getProjectLabel,
  normalizeProjectIds,
  type DashboardDateRange,
  type DashboardDevice,
  type DashboardFilters,
  type DashboardUserType,
} from "@/lib/dashboardFilters";
import { fetchSessionReplayAnalytics } from "@/lib/analyticsApi";
import { useActiveProjectIds } from "@/hooks/useActiveProjectIds";

function formatDuration(totalSec: number) {
  const m = Math.floor(totalSec / 60);
  const s = String(totalSec % 60).padStart(2, "0");
  return `${m}m ${s}s`;
}

export default function SessionReplayPage() {
  const fallbackProjectIds = import.meta.env.VITE_PROJECT_ID || "demo-project";
  const { activeProjectIds, setActiveProjectIds } = useActiveProjectIds(fallbackProjectIds);

  const [filters, setFilters] = useState<DashboardFilters>({
    dateRange: "Last 30 days",
    device: "All Devices",
    userType: "All Users",
    projectIds: activeProjectIds,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const { start, end } = getDateRangeBounds(filters.dateRange);
  const normalizedProjectIds = normalizeProjectIds(activeProjectIds || fallbackProjectIds);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["analytics", "sessions", normalizedProjectIds, start, end, filters.device, filters.userType, searchQuery],
    queryFn: () =>
      fetchSessionReplayAnalytics({
        projectIds: normalizedProjectIds,
        start,
        end,
        device: filters.device,
        userType: filters.userType,
        search: searchQuery.trim() || undefined,
        limit: 40,
      }),
  });

  const selectedSession = useMemo(() => {
    const sessions = data?.sessions ?? [];
    if (!sessions.length) return null;
    return sessions.find((session) => session.id === selectedSessionId) ?? sessions[0];
  }, [data?.sessions, selectedSessionId]);

  const projectLabel = getProjectLabel(normalizedProjectIds);

  return (
    <div className="space-y-6">
      <FilterBar
        title="Session Replay"
        subtitle={`Replay sessions from tracked DB events · ${projectLabel}`}
        dateRange={filters.dateRange}
        device={filters.device}
        userType={filters.userType}
        projectIds={activeProjectIds}
        onDateRangeChange={(value: DashboardDateRange) => setFilters((prev) => ({ ...prev, dateRange: value }))}
        onDeviceChange={(value: DashboardDevice) => setFilters((prev) => ({ ...prev, device: value }))}
        onUserTypeChange={(value: DashboardUserType) => setFilters((prev) => ({ ...prev, userType: value }))}
        onProjectIdsChange={setActiveProjectIds}
        onRefresh={async () => {
          await refetch();
        }}
      />

      {isLoading ? (
        <div className="grid lg:grid-cols-3 gap-4">
          <SkeletonCard className="lg:col-span-1" lines={8} />
          <SkeletonCard className="lg:col-span-2" lines={10} />
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 rounded-2xl border border-border bg-card p-4 shadow-card space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by session/user"
                className="pl-9 h-10"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-border p-3 text-center">
                <div className="text-lg font-semibold">{data?.stats.totalSessions ?? 0}</div>
                <div className="text-[10px] text-muted-foreground">Sessions</div>
              </div>
              <div className="rounded-xl border border-border p-3 text-center">
                <div className="text-lg font-semibold">{formatDuration(data?.stats.avgDurationSec ?? 0)}</div>
                <div className="text-[10px] text-muted-foreground">Avg duration</div>
              </div>
              <div className="rounded-xl border border-border p-3 text-center">
                <div className="text-lg font-semibold">{data?.stats.mobileSessions ?? 0}</div>
                <div className="text-[10px] text-muted-foreground">Mobile</div>
              </div>
            </div>

            <div className="max-h-[520px] overflow-y-auto space-y-2 pr-1">
              {(data?.sessions ?? []).map((session) => (
                <button
                  key={session.id}
                  className={`w-full rounded-xl border p-3 text-left transition ${selectedSession?.id === session.id ? "border-primary bg-accent/40" : "border-border hover:border-primary/40"}`}
                  onClick={() => {
                    setSelectedSessionId(session.id);
                    setProgress(0);
                    setPlaying(false);
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold truncate">{session.user}</div>
                      <div className="text-[11px] text-muted-foreground truncate">{session.email}</div>
                    </div>
                    {session.device === "mobile" ? <Smartphone className="h-4 w-4 text-muted-foreground" /> : session.device === "tablet" ? <Tablet className="h-4 w-4 text-muted-foreground" /> : <Monitor className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" /> {formatDuration(session.durationSec)}
                    <span>•</span>
                    <span>{session.pages} pages</span>
                    <span>•</span>
                    <span>{session.clicks} clicks</span>
                  </div>
                </button>
              ))}

              {!(data?.sessions ?? []).length && (
                <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  No sessions found for the selected project and filters.
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 rounded-2xl border border-border bg-card shadow-card overflow-hidden">
            {selectedSession ? (
              <>
                <div className="p-5 border-b border-border">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-semibold">{selectedSession.user}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">{selectedSession.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{selectedSession.device}</Badge>
                      <Badge variant="outline">{selectedSession.scrollDepth}% scroll</Badge>
                    </div>
                  </div>
                </div>

                <div className="p-5 border-b border-border bg-muted/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setProgress((prev) => Math.max(0, prev - 10))}>
                      <SkipBack className="h-4 w-4" />
                    </Button>
                    <Button variant="default" size="icon" className="h-9 w-9 rounded-full" onClick={() => setPlaying((prev) => !prev)}>
                      {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setProgress((prev) => Math.min(100, prev + 10))}>
                      <SkipForward className="h-4 w-4" />
                    </Button>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground w-14 text-right">{formatDuration(selectedSession.durationSec)}</span>
                  </div>

                  <div className="rounded-xl border border-border bg-card p-3 text-sm text-muted-foreground">
                    Replay generated from stored event timeline for this session.
                  </div>
                </div>

                <div className="max-h-[420px] overflow-y-auto">
                  {(selectedSession.events ?? []).map((event, index) => (
                    <div key={`${event.time}-${index}`} className="flex items-start gap-3 px-5 py-3 border-b border-border last:border-b-0">
                      <div className="w-12 text-xs font-mono text-muted-foreground">{event.time}</div>
                      <div className="flex-1">
                        <div className="text-sm font-medium capitalize">{event.type}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{event.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-muted-foreground">No replay data available yet for this project.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
