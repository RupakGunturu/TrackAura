import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { FilterBar } from "@/components/FilterBar";
import { Input } from "@/components/ui/input";
import { SkeletonCard } from "@/components/SkeletonCard";
import {
  type DashboardDateRange,
  type DashboardDevice,
  type DashboardFilters,
  type DashboardUserType,
  getProjectLabel,
  normalizeProjectIds,
} from "@/lib/dashboardFilters";
import { useActiveProjectIds } from "@/hooks/useActiveProjectIds";
import { fetchSessionList, fetchSessionReplay, type SessionListItem } from "@/lib/sessionReplayApi";
import { fetchProjects } from "@/lib/projectsApi";
import { SessionList } from "@/components/session-replay/SessionList";
import { SessionReplayViewer } from "@/components/session-replay/SessionReplayViewer";

export default function SessionReplayPage() {
  const { activeProjectIds, setActiveProjectIds } = useActiveProjectIds("");
  const [filters, setFilters] = useState<DashboardFilters>({
    dateRange: "Last 30 days",
    device: "All Devices",
    userType: "All Users",
    projectIds: activeProjectIds,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSession, setSelectedSession] = useState<SessionListItem | null>(null);

  const normalizedProjectIds = normalizeProjectIds(activeProjectIds);
  const hasProjectSelection = normalizedProjectIds.length > 0;

  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  const selectedProjectId = normalizedProjectIds.split(",")[0] ?? "";
  const selectedProject = (projectsQuery.data?.projects ?? []).find((project) => project.id === selectedProjectId) ?? null;

  const listQuery = useQuery({
    queryKey: ["session-replay", "list", normalizedProjectIds, searchQuery],
    queryFn: () =>
      fetchSessionList({
        projectId: normalizedProjectIds,
        search: searchQuery.trim() || undefined,
        limit: 50,
      }),
    enabled: hasProjectSelection,
    retry: 1,
  });

  const selectedSessionId = useMemo(() => {
    return selectedSession?.sessionId ?? listQuery.data?.sessions?.[0]?.sessionId ?? null;
  }, [selectedSession?.sessionId, listQuery.data?.sessions]);

  const replayQuery = useQuery({
    queryKey: ["session-replay", "viewer", normalizedProjectIds, selectedSessionId],
    queryFn: () =>
      fetchSessionReplay(selectedSessionId as string, {
        projectId: normalizedProjectIds,
      }),
    enabled: Boolean(selectedSessionId) && hasProjectSelection,
    retry: 1,
  });

  const projectLabel = getProjectLabel(normalizedProjectIds);

  return (
    <div className="space-y-6">
      <FilterBar
        title="Session Replay"
        subtitle={`MongoDB event replay timeline · ${projectLabel}`}
        dateRange={filters.dateRange}
        device={filters.device}
        userType={filters.userType}
        projectIds={activeProjectIds}
        onDateRangeChange={(value: DashboardDateRange) => setFilters((prev) => ({ ...prev, dateRange: value }))}
        onDeviceChange={(value: DashboardDevice) => setFilters((prev) => ({ ...prev, device: value }))}
        onUserTypeChange={(value: DashboardUserType) => setFilters((prev) => ({ ...prev, userType: value }))}
        onProjectIdsChange={setActiveProjectIds}
        onRefresh={async () => {
          await listQuery.refetch();
          await replayQuery.refetch();
        }}
      />

      {!hasProjectSelection && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-700">
          Select an integrated project to open session replay.
        </div>
      )}

      {hasProjectSelection && (
        <>
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="pl-9"
                placeholder="Search sessions by id"
              />
            </div>
          </div>

          {listQuery.isLoading ? (
            <SkeletonCard lines={8} />
          ) : listQuery.isError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 text-sm">
              Unable to load session list: {listQuery.error instanceof Error ? listQuery.error.message : "Request failed"}
            </div>
          ) : (
            <SessionList
              sessions={listQuery.data?.sessions ?? []}
              selectedSessionId={selectedSessionId}
              onReplay={setSelectedSession}
            />
          )}

          {replayQuery.isLoading ? (
            <SkeletonCard lines={12} />
          ) : replayQuery.isError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 text-sm">
              Unable to load replay: {replayQuery.error instanceof Error ? replayQuery.error.message : "Request failed"}
            </div>
          ) : replayQuery.data ? (
            <SessionReplayViewer
              events={replayQuery.data.events}
              durationMs={replayQuery.data.durationMs}
              page={replayQuery.data.page}
              previewUrl={selectedProject?.website_url ?? null}
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-600">
              Select a session to replay.
            </div>
          )}
        </>
      )}
    </div>
  );
}
