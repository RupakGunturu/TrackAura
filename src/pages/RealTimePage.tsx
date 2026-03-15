import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Calendar,
  ChevronDown,
  Download,
  FileText,
  FolderKanban,
  Globe,
  Monitor,
  RefreshCw,
  User,
  Users,
  Activity,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { SkeletonCard } from "@/components/SkeletonCard";
import { fetchProjects } from "@/lib/projectsApi";
import { fetchRealtimeAnalytics } from "@/lib/analyticsApi";
import {
  getDateRangeBounds,
  normalizeProjectIds,
  type DashboardUserType,
} from "@/lib/dashboardFilters";
import { useActiveProjectIds } from "@/hooks/useActiveProjectIds";

type RealtimeDateRange = "Today" | "Last 7 days" | "Last 30 days" | "Last 90 days" | "This year";
type RealtimeDevice = "All Devices" | "Desktop" | "Mobile" | "Tablet";

const DATE_OPTIONS: RealtimeDateRange[] = ["Today", "Last 7 days", "Last 30 days", "Last 90 days", "This year"];
const DEVICE_OPTIONS: RealtimeDevice[] = ["All Devices", "Desktop", "Mobile", "Tablet"];
const USER_OPTIONS: DashboardUserType[] = ["All Users", "Free", "Pro", "Enterprise"];

function getRealtimeBounds(dateRange: RealtimeDateRange) {
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

function toApiDevice(device: RealtimeDevice): "All Devices" | "Web" | "Mobile" | "Tablet" {
  if (device === "Desktop") return "Web";
  return device;
}

function formatDuration(totalSec: number) {
  const safe = Math.max(0, Math.round(totalSec));
  const m = Math.floor(safe / 60);
  const s = String(safe % 60).padStart(2, "0");
  return `${m}m ${s}s`;
}

function trendText(value: number) {
  if (value === 0) return "0%";
  return `${value > 0 ? "↑" : "↓"} ${Math.abs(value)}%`;
}

function donutSegments(values: number[]) {
  const total = Math.max(1, values.reduce((acc, value) => acc + value, 0));
  let offset = 0;

  return values.map((value) => {
    const length = Math.round((value / total) * 151);
    const segment = { length, offset };
    offset += length;
    return segment;
  });
}

function getRegionFlag(name: string) {
  const map: Record<string, string> = {
    "India - North": "🇮🇳",
    "India - West": "🇮🇳",
    "India - South": "🇮🇳",
    "India - East": "🇮🇳",
    "India - Central": "🇮🇳",
  };

  return map[name] ?? "🇮🇳";
}

function normalizeIndiaRegion(name: string) {
  const normalized: Record<string, string> = {
    "North America": "India - North",
    Europe: "India - West",
    "Asia-Pacific": "India - South",
    "Rest of World": "India - East",
  };

  return normalized[name] ?? name;
}

export default function RealTimePage() {
  const { activeProjectIds, setActiveProjectIds } = useActiveProjectIds("");

  const [dateRange, setDateRange] = useState<RealtimeDateRange>("Last 30 days");
  const [device, setDevice] = useState<RealtimeDevice>("All Devices");
  const [userType, setUserType] = useState<DashboardUserType>("All Users");

  const normalizedProjectIds = normalizeProjectIds(activeProjectIds);
  const hasProjectSelection = normalizedProjectIds.length > 0;

  const { start, end } = useMemo(() => getRealtimeBounds(dateRange), [dateRange]);

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

  const realtimeQuery = useQuery({
    queryKey: ["analytics", "realtime", normalizedProjectIds, start, end, device, userType],
    queryFn: () =>
      fetchRealtimeAnalytics({
        projectIds: normalizedProjectIds,
        start,
        end,
        device: toApiDevice(device),
        userType,
      }),
    enabled: hasProjectSelection,
    refetchInterval: hasProjectSelection ? 5000 : false,
    retry: 1,
  });

  const { data, isPending, isFetching, isError, error, refetch } = realtimeQuery;

  const trendPct = useMemo(() => {
    const points = data?.data ?? [];
    if (points.length < 10) return 0;

    const recent = points.slice(-5);
    const previous = points.slice(-10, -5);

    const avgRecent = recent.reduce((acc, point) => acc + point.v, 0) / Math.max(1, recent.length);
    const avgPrevious = previous.reduce((acc, point) => acc + point.v, 0) / Math.max(1, previous.length);

    if (avgPrevious === 0) return avgRecent > 0 ? 100 : 0;
    return Math.round(((avgRecent - avgPrevious) / avgPrevious) * 100);
  }, [data?.data]);

  const newCount = data?.newVsReturning?.new ?? 0;
  const returningCount = data?.newVsReturning?.returning ?? 0;
  const sessionTotal = Math.max(1, newCount + returningCount);
  const newPct = Math.round((newCount / sessionTotal) * 100);
  const returningPct = 100 - newPct;

  const mobilePct = data?.deviceBreakdown?.find((item) => item.name === "mobile")?.value ?? 0;
  const desktopPct = data?.deviceBreakdown?.find((item) => item.name === "desktop")?.value ?? 0;
  const tabletPct = data?.deviceBreakdown?.find((item) => item.name === "tablet")?.value ?? 0;

  const newReturningSegments = donutSegments([newPct, returningPct]);
  const deviceSegments = donutSegments([mobilePct, desktopPct, tabletPct]);

  const sparkValues = (data?.data ?? []).slice(-12).map((point) => point.v);
  const sparkMax = Math.max(1, ...sparkValues);

  const pageRows = (data?.pages ?? []).slice(0, 6);
  const pageMaxEvents = Math.max(1, ...pageRows.map((row) => row.events));

  const projectLabel = useMemo(() => {
    const allProjects = projectsQuery.data?.projects ?? [];
    if (!allProjects.length || !selectedProjectIds.length) return "All Projects";

    if (selectedProjectIds.length === allProjects.length) {
      return "All Projects";
    }

    if (selectedProjectIds.length === 1) {
      return allProjects.find((project) => project.id === selectedProjectIds[0])?.name ?? selectedProjectIds[0];
    }

    return `${selectedProjectIds.length} projects`;
  }, [projectsQuery.data?.projects, selectedProjectIds]);

  const activeTags = useMemo(() => {
    const tags = [`Date · ${dateRange}`];

    if (device !== "All Devices") tags.push(`Device · ${device}`);
    if (userType !== "All Users") tags.push(`User · ${userType}`);
    if (projectLabel !== "All Projects") tags.push(`Project · ${projectLabel}`);

    return tags;
  }, [dateRange, device, userType, projectLabel]);

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

  const handleExport = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `realtime-${normalizedProjectIds || "all-projects"}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-[1280px] space-y-4 px-2 py-2">
      <section>
        <div className="mb-3 flex items-center gap-3">
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#0f2d0f]">Real-Time</h1>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#a8ddb5] bg-[#dcf5e0] px-3 py-1 text-[11px] font-semibold text-[#1a6e2e]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1cb54a] shadow-[0_0_0_3px_rgba(28,181,74,0.2)]" />
            Live
          </span>
        </div>

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
              onClick={() => void refetch()}
              className="h-8 rounded-lg border border-[#daeeda] bg-white px-3 text-xs font-medium text-[#2a5c2a]"
            >
              <RefreshCw className={`mr-1 h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              onClick={handleExport}
              className="h-8 rounded-lg bg-[#1a6e2e] px-3 text-xs font-semibold text-white hover:bg-[#155a24]"
            >
              <Download className="mr-1 h-3.5 w-3.5" />
              Export
            </Button>
          </div>
        </div>
      </section>

      <section className="flex min-h-[24px] flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full border border-[#c0e8cc] bg-[#edfaef] px-3 py-1 text-[11px] font-medium text-[#1a6e2e]">
          <span className="opacity-60">Date ·</span> {dateRange}
          {dateRange !== "Last 30 days" && (
            <button onClick={() => resetFilter("date")} className="ml-1 opacity-60 hover:opacity-100">
              ✕
            </button>
          )}
        </span>

        {device !== "All Devices" && (
          <span className="inline-flex items-center gap-1 rounded-full border border-[#c0e8cc] bg-[#edfaef] px-3 py-1 text-[11px] font-medium text-[#1a6e2e]">
            <span className="opacity-60">Device ·</span> {device}
            <button onClick={() => resetFilter("device")} className="ml-1 opacity-60 hover:opacity-100">
              ✕
            </button>
          </span>
        )}

        {userType !== "All Users" && (
          <span className="inline-flex items-center gap-1 rounded-full border border-[#c0e8cc] bg-[#edfaef] px-3 py-1 text-[11px] font-medium text-[#1a6e2e]">
            <span className="opacity-60">User ·</span> {userType}
            <button onClick={() => resetFilter("user")} className="ml-1 opacity-60 hover:opacity-100">
              ✕
            </button>
          </span>
        )}

        {projectLabel !== "All Projects" && (
          <span className="inline-flex items-center gap-1 rounded-full border border-[#c0e8cc] bg-[#edfaef] px-3 py-1 text-[11px] font-medium text-[#1a6e2e]">
            <span className="opacity-60">Project ·</span> {projectLabel}
            <button onClick={() => resetFilter("project")} className="ml-1 opacity-60 hover:opacity-100">
              ✕
            </button>
          </span>
        )}

        {activeTags.length > 1 && (
          <button onClick={clearAll} className="text-[11px] text-[#aac8aa] hover:text-[#1a6e2e] hover:underline">
            Clear all
          </button>
        )}
      </section>

      {!hasProjectSelection && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-700">
          Select a project to load realtime analytics.
        </div>
      )}

      {hasProjectSelection && isPending && !data && <SkeletonCard lines={10} />}

      {hasProjectSelection && isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Unable to load realtime analytics: {error instanceof Error ? error.message : "Request failed"}
        </div>
      )}

      {hasProjectSelection && !isPending && !isError && (
        <>
          <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-[#daeeda] bg-white p-5">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-[#0f2d0f]">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#edfaef]">
                  <Users className="h-3.5 w-3.5 text-[#1a6e2e]" />
                </span>
                New vs Returning
              </div>
              <div className="flex items-center gap-4">
                <svg width="96" height="96" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="24" fill="none" stroke="#edf5ed" strokeWidth="10" />
                  <circle
                    cx="32"
                    cy="32"
                    r="24"
                    fill="none"
                    stroke="#1a8c3a"
                    strokeWidth="10"
                    strokeDasharray={`${newReturningSegments[0]?.length ?? 0} 151`}
                    strokeDashoffset="-6"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="24"
                    fill="none"
                    stroke="#99ddaa"
                    strokeWidth="10"
                    strokeDasharray={`${newReturningSegments[1]?.length ?? 0} 151`}
                    strokeDashoffset={`-${6 + (newReturningSegments[0]?.length ?? 0)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="space-y-1 text-[11px] text-[#2a4a2a]">
                  <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-[2px] bg-[#1a8c3a]" />New - {newPct}%</div>
                  <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-[2px] bg-[#99ddaa]" />Returning - {returningPct}%</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#daeeda] bg-white p-5">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-[#0f2d0f]">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#edfaef]">
                  <Monitor className="h-3.5 w-3.5 text-[#1a6e2e]" />
                </span>
                Device Breakdown
              </div>
              <div className="flex items-center gap-4">
                <svg width="96" height="96" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="24" fill="none" stroke="#edf5ed" strokeWidth="10" />
                  <circle cx="32" cy="32" r="24" fill="none" stroke="#1a8c3a" strokeWidth="10" strokeDasharray={`${deviceSegments[0]?.length ?? 0} 151`} strokeDashoffset="-6" strokeLinecap="round" />
                  <circle cx="32" cy="32" r="24" fill="none" stroke="#55bb70" strokeWidth="10" strokeDasharray={`${deviceSegments[1]?.length ?? 0} 151`} strokeDashoffset={`-${6 + (deviceSegments[0]?.length ?? 0)}`} strokeLinecap="round" />
                  <circle cx="32" cy="32" r="24" fill="none" stroke="#bbeecc" strokeWidth="10" strokeDasharray={`${deviceSegments[2]?.length ?? 0} 151`} strokeDashoffset={`-${6 + (deviceSegments[0]?.length ?? 0) + (deviceSegments[1]?.length ?? 0)}`} strokeLinecap="round" />
                </svg>
                <div className="space-y-1 text-[11px] text-[#2a4a2a]">
                  <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-[2px] bg-[#1a8c3a]" />Mobile - {mobilePct}%</div>
                  <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-[2px] bg-[#55bb70]" />Desktop - {desktopPct}%</div>
                  <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-[2px] bg-[#bbeecc]" />Tablet - {tabletPct}%</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#daeeda] bg-white p-5">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-[#0f2d0f]">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#edfaef]">
                  <Activity className="h-3.5 w-3.5 text-[#1a6e2e]" />
                </span>
                Peak Traffic Today
              </div>
              <div className="text-[28px] font-semibold leading-none text-[#0f2d0f]">{data?.peakTraffic?.time ?? "--:--"}</div>
              <div className="mt-1 text-[11px] text-[#9ab89a]">{(data?.peakTraffic?.users ?? 0).toLocaleString()} concurrent users</div>
              <div className={`mt-2 text-[11px] ${(data?.peakTraffic?.deltaPct ?? 0) >= 0 ? "text-[#1a8c3a]" : "text-[#cc4444]"}`}>
                {trendText(data?.peakTraffic?.deltaPct ?? 0)} above daily avg
              </div>
              <div className="mt-3 flex h-8 items-end gap-1">
                {sparkValues.map((value, index) => (
                  <div
                    key={`${index}-${value}`}
                    className="flex-1 rounded-[3px] bg-[#66cc80]"
                    style={{ height: `${Math.max(20, Math.round((value / sparkMax) * 100))}%` }}
                  />
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-[18px] border border-[#daeeda] bg-white p-6">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7aaa7a]">Users online right now</div>
                <div className="text-[58px] font-light leading-none tracking-[-0.05em] text-[#0a2a0a]">
                  <strong className="font-semibold">{data?.onlineUsers?.toLocaleString() ?? 0}</strong>
                </div>
                <div className="mt-2 text-[11px] text-[#9ab89a]">
                  Last updated · {data ? new Date(data.lastUpdated).toLocaleTimeString() : "--:--:--"} · auto-refreshes every 5s
                </div>
              </div>
              <div className="rounded-xl border border-[#b0e8bf] bg-[#edfaef] px-4 py-3 text-right">
                <div className="text-xl font-semibold text-[#1a6e2e]">{trendText(trendPct)}</div>
                <div className="text-[10px] text-[#7aaa7a]">vs previous window</div>
              </div>
            </div>

            <div className="h-[148px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.data ?? []} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rtGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(26,140,58,0.15)" />
                      <stop offset="100%" stopColor="rgba(26,140,58,0)" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#f0f7f0" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#9ab89a" }} tickLine={false} axisLine={false} interval={9} />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#9ab89a" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value: number) => (value >= 1000 ? `${(value / 1000).toFixed(1)}k` : `${value}`)}
                  />
                  <Tooltip formatter={(value: number) => [`${value.toLocaleString()} users`, "Live"]} />
                  <Area type="monotone" dataKey="v" stroke="#1a8c3a" strokeWidth={2} fill="url(#rtGradient)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-5 grid grid-cols-1 overflow-hidden rounded-xl border border-[#daeeda] bg-[#edf5ed] md:grid-cols-3">
              <div className="bg-white px-4 py-3">
                <div className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#9ab89a]">Sessions</div>
                <div className="mt-1 text-[17px] font-semibold text-[#0f2d0f]">{(data?.stats?.sessions ?? 0).toLocaleString()}</div>
                <div className="mt-1 text-[10px] text-[#1a8c3a]">{trendText(trendPct)}</div>
              </div>
              <div className="bg-white px-4 py-3 md:border-l md:border-r md:border-[#edf5ed]">
                <div className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#9ab89a]">Avg. Duration</div>
                <div className="mt-1 text-[17px] font-semibold text-[#0f2d0f]">{formatDuration(data?.stats?.avgDurationSec ?? 0)}</div>
                <div className="mt-1 text-[10px] text-[#1a8c3a]">Live from session events</div>
              </div>
              <div className="bg-white px-4 py-3">
                <div className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#9ab89a]">Bounce Rate</div>
                <div className="mt-1 text-[17px] font-semibold text-[#0f2d0f]">{(data?.stats?.bounceRate ?? 0).toFixed(1)}%</div>
                <div className="mt-1 text-[10px] text-[#cc4444]">Single-page sessions</div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="overflow-hidden rounded-2xl border border-[#daeeda] bg-white">
              <div className="flex items-center justify-between border-b border-[#f0f7f0] px-4 py-3">
                <div className="flex items-center gap-2 text-[13px] font-semibold text-[#0f2d0f]">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#edfaef]">
                    <Globe className="h-3.5 w-3.5 text-[#1a6e2e]" />
                  </span>
                  Users by Region
                </div>
                <span className="rounded-md border border-[#daeeda] bg-[#f4faf4] px-2 py-0.5 text-[10px] text-[#9ab89a]">
                  {(data?.regions ?? []).length} regions
                </span>
              </div>

              <table className="w-full border-collapse">
                <tbody>
                  {(data?.regions ?? []).map((region) => {
                    const regionName = normalizeIndiaRegion(region.name);
                    return (
                    <tr key={region.name} className="border-b border-[#f4faf4] last:border-b-0">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2 text-xs font-medium text-[#1a2a1a]">
                          <span>{getRegionFlag(regionName)}</span>
                          {regionName}
                        </div>
                      </td>
                      <td className="w-[36%] px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#f0f7f0]">
                            <div className="h-full rounded-full bg-[#1a8c3a]" style={{ width: `${region.pct}%` }} />
                          </div>
                          <span className="w-8 text-right text-[10px] text-[#9ab89a]">{region.pct}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-right text-xs font-semibold text-[#1a6e2e]">{region.users.toLocaleString()}</td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#daeeda] bg-white">
              <div className="flex items-center justify-between border-b border-[#f0f7f0] px-4 py-3">
                <div className="flex items-center gap-2 text-[13px] font-semibold text-[#0f2d0f]">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#edfaef]">
                    <FileText className="h-3.5 w-3.5 text-[#1a6e2e]" />
                  </span>
                  Active Pages
                </div>
                <span className="rounded-md border border-[#daeeda] bg-[#f4faf4] px-2 py-0.5 text-[10px] text-[#9ab89a]">
                  {pageRows.length} pages
                </span>
              </div>

              <div className="grid grid-cols-1 gap-px bg-[#f0f7f0] sm:grid-cols-2">
                {pageRows.map((page, index) => (
                  <div key={page.path} className="bg-white p-3">
                    <div className="text-[10px] font-semibold tracking-[0.04em] text-[#c0ddc0]">#{index + 1}</div>
                    <div className="mt-0.5 truncate font-mono text-[10px] text-[#1a3a1a]">{page.path}</div>
                    <div className="mt-1 text-[13px] font-semibold text-[#0f2d0f]">{page.events.toLocaleString()}</div>
                    <div className="mt-1.5 h-[3px] overflow-hidden rounded-full bg-[#edf5ed]">
                      <div className="h-full rounded-full bg-[#2eaa50]" style={{ width: `${Math.round((page.events / pageMaxEvents) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
