import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  ChevronDown,
  FolderKanban,
  Monitor,
  RefreshCw,
  Search,
  Smartphone,
  Tablet,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { SkeletonCard } from "@/components/SkeletonCard";
import { fetchProjects } from "@/lib/projectsApi";
import { fetchSessionList, fetchSessionReplay, type SessionListItem } from "@/lib/sessionReplayApi";
import { getDateRangeBounds, normalizeProjectIds, type DashboardUserType } from "@/lib/dashboardFilters";
import { useActiveProjectIds } from "@/hooks/useActiveProjectIds";
import { SessionReplayViewer } from "@/components/session-replay/SessionReplayViewer";

type SessionDateRange = "Today" | "Last 7 days" | "Last 30 days" | "Last 90 days" | "This year";
type SessionDevice = "All Devices" | "Desktop" | "Mobile" | "Tablet";

const DATE_OPTIONS: SessionDateRange[] = ["Today", "Last 7 days", "Last 30 days", "Last 90 days", "This year"];
const DEVICE_OPTIONS: SessionDevice[] = ["All Devices", "Desktop", "Mobile", "Tablet"];
const USER_OPTIONS: DashboardUserType[] = ["All Users", "Free", "Pro", "Enterprise"];

function getSessionBounds(dateRange: SessionDateRange) {
  if (dateRange === "Today") {
    const end = new Date();
    const start = new Date(end);
    start.setHours(0, 0, 0, 0);
    return { start: start.toISOString(), end: end.toISOString() };
  }

  if (dateRange === "This year") {
    const end = new Date();
    const start = new Date(end.getFullYear(), 0, 1);
    return { start: start.toISOString(), end: end.toISOString() };
  }

  return getDateRangeBounds(dateRange);
}

function deviceLabel(value: SessionListItem["deviceType"]) {
  if (value === "mobile") return "Mobile";
  if (value === "tablet") return "Tablet";
  return "Desktop";
}

function DeviceIcon({ value }: { value: SessionListItem["deviceType"] }) {
  if (value === "mobile") return <Smartphone className="h-3 w-3" />;
  if (value === "tablet") return <Tablet className="h-3 w-3" />;
  return <Monitor className="h-3 w-3" />;
}

function formatDuration(totalSec: number) {
  const m = Math.floor(totalSec / 60);
  const s = String(totalSec % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function formatAge(startedAt: string) {
  const started = new Date(startedAt).getTime();
  const diffSec = Math.max(0, Math.floor((Date.now() - started) / 1000));
  if (diffSec < 60) return `${diffSec}s ago`;
  const min = Math.floor(diffSec / 60);
  if (min < 60) return `${min} min ago`;
  const h = Math.floor(min / 60);
  return `${h} hr ago`;
}

function toDots(eventCount: number) {
  if (eventCount >= 30) return ["#1a8c3a", "#f0a500", "#cc3333"];
  if (eventCount >= 15) return ["#1a8c3a", "#f0a500", "#5aaa7a"];
  return ["#1a8c3a", "#1a8c3a", "#5aaa7a"];
}

export default function SessionReplayPage() {
  const { activeProjectIds, setActiveProjectIds } = useActiveProjectIds("");

  const [dateRange, setDateRange] = useState<SessionDateRange>("Last 30 days");
  const [device, setDevice] = useState<SessionDevice>("All Devices");
  const [userType, setUserType] = useState<DashboardUserType>("All Users");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSession, setSelectedSession] = useState<SessionListItem | null>(null);

  const normalizedProjectIds = normalizeProjectIds(activeProjectIds);
  const hasProjectSelection = normalizedProjectIds.length > 0;
  const { start, end } = useMemo(() => getSessionBounds(dateRange), [dateRange]);

  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  const selectedProjectIds = useMemo(
    () =>
      normalizedProjectIds
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    [normalizedProjectIds]
  );

  const selectedProjectId = normalizedProjectIds.split(",")[0] ?? "";
  const selectedProject = (projectsQuery.data?.projects ?? []).find((project) => project.id === selectedProjectId) ?? null;

  const listQuery = useQuery({
    queryKey: ["session-replay", "list", normalizedProjectIds, searchQuery, dateRange, device, userType, start, end],
    queryFn: () =>
      fetchSessionList({
        projectId: normalizedProjectIds,
        search: searchQuery.trim() || undefined,
        limit: 80,
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

  const projectLabel = useMemo(() => {
    const allProjects = projectsQuery.data?.projects ?? [];
    if (!allProjects.length || !selectedProjectIds.length) return "All Projects";

    if (selectedProjectIds.length === allProjects.length) return "All Projects";

    if (selectedProjectIds.length === 1) {
      return allProjects.find((project) => project.id === selectedProjectIds[0])?.name ?? selectedProjectIds[0];
    }

    return `${selectedProjectIds.length} projects`;
  }, [projectsQuery.data?.projects, selectedProjectIds]);

  const toggleProject = (projectId: string) => {
    const next = selectedProjectIds.includes(projectId)
      ? selectedProjectIds.filter((id) => id !== projectId)
      : [...selectedProjectIds, projectId];

    setActiveProjectIds(next.join(","));
  };

  const setAllProjects = () => {
    const ids = (projectsQuery.data?.projects ?? []).map((project) => project.id).join(",");
    setActiveProjectIds(ids);
  };

  const resetFilter = (key: "date" | "device" | "user" | "project") => {
    if (key === "date") setDateRange("Last 30 days");
    if (key === "device") setDevice("All Devices");
    if (key === "user") setUserType("All Users");
    if (key === "project") setAllProjects();
  };

  const clearAll = () => {
    setDevice("All Devices");
    setUserType("All Users");
    setAllProjects();
  };

  const activeTagCount = [device !== "All Devices", userType !== "All Users", projectLabel !== "All Projects"].filter(Boolean).length;

  const sessions = listQuery.data?.sessions ?? [];

  return (
    <div className="mx-auto max-w-[1440px] space-y-4 px-2 py-2">
      <section>
        <div className="mb-3 text-[22px] font-semibold tracking-[-0.02em] text-[#0f2d0f]">Session Replay</div>

        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={`h-8 rounded-lg border px-3 text-xs font-medium ${dateRange !== "Last 30 days" ? "border-[#a8ddb5] bg-[#edfaef] text-[#1a6e2e]" : "border-[#daeeda] bg-white text-[#1a3a1a]"}`}
              >
                <Calendar className="mr-1 h-3.5 w-3.5 opacity-70" />
                {dateRange}
                <ChevronDown className="ml-1 h-3.5 w-3.5 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              {DATE_OPTIONS.map((option) => (
                <DropdownMenuItem key={option} onClick={() => setDateRange(option)}>
                  {option}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-8 rounded-lg border border-[#daeeda] bg-white px-3 text-xs font-medium text-[#1a3a1a]">
                <Monitor className="mr-1 h-3.5 w-3.5 opacity-70" />
                {device}
                <ChevronDown className="ml-1 h-3.5 w-3.5 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40">
              {DEVICE_OPTIONS.map((option) => (
                <DropdownMenuItem key={option} onClick={() => setDevice(option)}>
                  {option}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-8 rounded-lg border border-[#daeeda] bg-white px-3 text-xs font-medium text-[#1a3a1a]">
                <User className="mr-1 h-3.5 w-3.5 opacity-70" />
                {userType}
                <ChevronDown className="ml-1 h-3.5 w-3.5 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40">
              {USER_OPTIONS.map((option) => (
                <DropdownMenuItem key={option} onClick={() => setUserType(option)}>
                  {option}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-8 rounded-lg border border-[#daeeda] bg-white px-3 text-xs font-medium text-[#1a3a1a]">
                <FolderKanban className="mr-1 h-3.5 w-3.5 opacity-70" />
                {projectLabel}
                <ChevronDown className="ml-1 h-3.5 w-3.5 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuItem onClick={setAllProjects}>All Projects</DropdownMenuItem>
              {(projectsQuery.data?.projects ?? []).map((project) => (
                <DropdownMenuCheckboxItem
                  key={project.id}
                  checked={selectedProjectIds.includes(project.id)}
                  onCheckedChange={() => toggleProject(project.id)}
                >
                  {project.name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-5 w-px bg-[#daeeda]" />

          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              onClick={async () => {
                await listQuery.refetch();
                await replayQuery.refetch();
              }}
              className="h-8 rounded-lg border border-[#daeeda] bg-white px-3 text-xs font-medium text-[#2a5c2a]"
            >
              <RefreshCw className={`mr-1 h-3.5 w-3.5 ${listQuery.isFetching || replayQuery.isFetching ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </section>

      <section className="flex min-h-[24px] flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full border border-[#c0e8cc] bg-[#edfaef] px-3 py-1 text-[11px] font-medium text-[#1a6e2e]">
          <span className="opacity-60">Date ·</span> {dateRange}
          {dateRange !== "Last 30 days" && (
            <button onClick={() => resetFilter("date")} className="ml-1 opacity-60 hover:opacity-100">✕</button>
          )}
        </span>

        {device !== "All Devices" && (
          <span className="inline-flex items-center gap-1 rounded-full border border-[#c0e8cc] bg-[#edfaef] px-3 py-1 text-[11px] font-medium text-[#1a6e2e]">
            <span className="opacity-60">Device ·</span> {device}
            <button onClick={() => resetFilter("device")} className="ml-1 opacity-60 hover:opacity-100">✕</button>
          </span>
        )}

        {userType !== "All Users" && (
          <span className="inline-flex items-center gap-1 rounded-full border border-[#c0e8cc] bg-[#edfaef] px-3 py-1 text-[11px] font-medium text-[#1a6e2e]">
            <span className="opacity-60">User ·</span> {userType}
            <button onClick={() => resetFilter("user")} className="ml-1 opacity-60 hover:opacity-100">✕</button>
          </span>
        )}

        {projectLabel !== "All Projects" && (
          <span className="inline-flex items-center gap-1 rounded-full border border-[#c0e8cc] bg-[#edfaef] px-3 py-1 text-[11px] font-medium text-[#1a6e2e]">
            <span className="opacity-60">Project ·</span> {projectLabel}
            <button onClick={() => resetFilter("project")} className="ml-1 opacity-60 hover:opacity-100">✕</button>
          </span>
        )}

        {activeTagCount > 0 && (
          <button onClick={clearAll} className="text-[11px] text-[#aac8aa] hover:text-[#1a6e2e] hover:underline">
            Clear all
          </button>
        )}
      </section>

      {!hasProjectSelection && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-700">
          Select a project to load session replay data.
        </div>
      )}

      {hasProjectSelection && (
        <>
          <section className="rounded-xl border border-[#daeeda] bg-white px-4 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ab89a]" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="h-10 border-0 bg-transparent pl-9 text-[13px] text-[#1a3a1a] shadow-none placeholder:text-[#aac8aa] focus-visible:ring-0"
                placeholder="Search sessions by ID, page, or user..."
              />
            </div>
          </section>

          {listQuery.isLoading && !listQuery.data ? (
            <SkeletonCard lines={10} />
          ) : listQuery.isError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
              Unable to load session list: {listQuery.error instanceof Error ? listQuery.error.message : "Request failed"}
            </div>
          ) : (
            <section className="grid grid-cols-1 gap-3 lg:grid-cols-[300px_1fr]">
              <div className="flex max-h-[780px] flex-col overflow-hidden rounded-2xl border border-[#daeeda] bg-white">
                <div className="flex items-center justify-between border-b border-[#f0f7f0] px-4 py-3">
                  <div className="text-[13px] font-semibold text-[#0f2d0f]">Sessions</div>
                  <div className="rounded-md border border-[#daeeda] bg-[#f4faf4] px-2 py-0.5 text-[10px] text-[#9ab89a]">{sessions.length} sessions</div>
                </div>

                <div className="overflow-y-auto">
                  {sessions.length === 0 && <div className="px-4 py-8 text-sm text-[#9ab89a]">No sessions found yet.</div>}

                  {sessions.map((session) => {
                    const selected = selectedSessionId === session.sessionId;
                    const dots = toDots(session.eventCount);

                    return (
                      <button
                        key={session.sessionId}
                        className={`w-full border-b border-[#f7fbf7] px-4 py-3 text-left transition hover:bg-[#fafff8] ${selected ? "border-l-[3px] border-l-[#1a8c3a] bg-[#edfaef]" : "border-l-[3px] border-l-transparent"}`}
                        onClick={() => setSelectedSession(session)}
                      >
                        <div className="mb-1 flex items-center justify-between">
                          <span className="font-mono text-[11px] font-medium text-[#1a3a1a]">{session.sessionId.slice(0, 16)}...</span>
                          <span className="rounded-[5px] bg-[#edfaef] px-1.5 py-0.5 text-[10px] font-semibold text-[#1a6e2e]">{formatDuration(session.durationSec)}</span>
                        </div>

                        <div className="mb-1 flex items-center gap-1.5 text-[10px] text-[#9ab89a]">
                          <span className="inline-flex items-center gap-1">
                            <DeviceIcon value={session.deviceType} /> {deviceLabel(session.deviceType)}
                          </span>
                          <span className="truncate font-mono text-[#5a8a5a]">{session.page}</span>
                          <span className="ml-auto text-[#aac8aa]">{formatAge(session.startedAt)}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          {dots.map((dot, index) => (
                            <span key={`${session.sessionId}-dot-${index}`} className="h-[5px] w-[5px] rounded-full" style={{ background: dot }} />
                          ))}
                          <span className="ml-1 text-[9px] text-[#9ab89a]">{session.eventCount} events</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {replayQuery.isLoading ? (
                <SkeletonCard lines={12} />
              ) : replayQuery.isError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
                  Unable to load replay: {replayQuery.error instanceof Error ? replayQuery.error.message : "Request failed"}
                </div>
              ) : replayQuery.data ? (
                <SessionReplayViewer
                  events={replayQuery.data.events}
                  durationMs={replayQuery.data.durationMs}
                  page={replayQuery.data.page}
                  previewUrl={selectedProject?.website_url ?? null}
                  sessionId={replayQuery.data.sessionId}
                  deviceType={replayQuery.data.deviceType}
                />
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-600">
                  Select a session to replay.
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
