import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  Calendar,
  ChevronDown,
  Download,
  Filter,
  FolderKanban,
  Monitor,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SkeletonCard } from "@/components/SkeletonCard";
import { fetchProjects } from "@/lib/projectsApi";
import { fetchRetentionAnalytics } from "@/lib/analyticsApi";
import { getDateRangeBounds, normalizeProjectIds, type DashboardUserType } from "@/lib/dashboardFilters";
import { useActiveProjectIds } from "@/hooks/useActiveProjectIds";

type RetentionDateRange = "Today" | "Last 7 days" | "Last 30 days" | "Last 90 days" | "This year";
type RetentionDevice = "All Devices" | "Desktop" | "Mobile" | "Tablet";

const DATE_OPTIONS: RetentionDateRange[] = ["Today", "Last 7 days", "Last 30 days", "Last 90 days", "This year"];
const DEVICE_OPTIONS: RetentionDevice[] = ["All Devices", "Desktop", "Mobile", "Tablet"];
const USER_OPTIONS: DashboardUserType[] = ["All Users", "Free", "Pro", "Enterprise"];

function getRetentionBounds(dateRange: RetentionDateRange) {
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

function toApiDevice(device: RetentionDevice): "All Devices" | "Web" | "Mobile" | "Tablet" {
  if (device === "Desktop") return "Web";
  return device;
}

function getCellBg(value: number | null): string {
  if (value === null) return "transparent";
  if (value >= 90) return "#0a4a1e";
  if (value >= 70) return "#1a8c3a";
  if (value >= 55) return "#2eaa50";
  if (value >= 40) return "#5aaa7a";
  if (value >= 25) return "#9fd4b2";
  return "#d4eedd";
}

function getCellText(value: number | null): string {
  if (value === null) return "";
  return value >= 50 ? "#ffffff" : "#1a3a1a";
}

function formatCompactCount(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return value.toString();
}

function findColumnIndex(columns: string[], target: string) {
  return columns.findIndex((column) => column.toLowerCase() === target.toLowerCase());
}

function calculateAvgForColumn(values: Array<Array<number | null>>, columnIndex: number) {
  if (columnIndex < 0) return 0;
  const valid = values.map((row) => row[columnIndex]).filter((value): value is number => value !== null);
  if (!valid.length) return 0;
  return Math.round(valid.reduce((acc, value) => acc + value, 0) / valid.length);
}

function calculateDelta(current: number, previous: number) {
  if (previous <= 0) return 0;
  return Math.round(((current - previous) / previous) * 100);
}

export default function RetentionPage() {
  const { activeProjectIds, setActiveProjectIds } = useActiveProjectIds("");

  const [dateRange, setDateRange] = useState<RetentionDateRange>("Last 30 days");
  const [device, setDevice] = useState<RetentionDevice>("All Devices");
  const [userType, setUserType] = useState<DashboardUserType>("All Users");

  const normalizedProjectIds = normalizeProjectIds(activeProjectIds);
  const hasProjectSelection = normalizedProjectIds.length > 0;
  const { start, end } = useMemo(() => getRetentionBounds(dateRange), [dateRange]);

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

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ["analytics", "retention", normalizedProjectIds, start, end, device, userType],
    queryFn: () =>
      fetchRetentionAnalytics({
        projectIds: normalizedProjectIds,
        start,
        end,
        device: toApiDevice(device),
        userType,
      }),
    enabled: hasProjectSelection,
    retry: 1,
  });

  const columns = data?.cohortColumns ?? [];
  const rows = data?.cohortData ?? [];

  const maxUsers = Math.max(1, ...rows.map((row) => row.users));

  const avgSeries = useMemo(() => {
    return columns.map((column, index) => ({
      period: column,
      retention: calculateAvgForColumn(
        rows.map((row) => row.retention),
        index
      ),
    }));
  }, [columns, rows]);

  const curveData = useMemo(() => {
    return avgSeries.map((point) => ({
      ...point,
      label: point.period.replace("Day ", "D"),
    }));
  }, [avgSeries]);

  const day1Index = findColumnIndex(columns, "Day 1");
  const day7Index = findColumnIndex(columns, "Day 7");
  const day30Index = findColumnIndex(columns, "Day 30");

  const day1Avg = calculateAvgForColumn(rows.map((row) => row.retention), day1Index);
  const day7Avg = calculateAvgForColumn(rows.map((row) => row.retention), day7Index);
  const day30Avg = calculateAvgForColumn(rows.map((row) => row.retention), day30Index);

  const deltaMetrics = useMemo(() => {
    if (rows.length < 2) {
      return { day1: 0, day7: 0, day30: 0 };
    }

    const latestSlice = rows.slice(0, Math.ceil(rows.length / 2));
    const previousSlice = rows.slice(Math.ceil(rows.length / 2));

    const latestRows = latestSlice.map((row) => row.retention);
    const previousRows = previousSlice.map((row) => row.retention);

    const latestDay1 = calculateAvgForColumn(latestRows, day1Index);
    const previousDay1 = calculateAvgForColumn(previousRows, day1Index);
    const latestDay7 = calculateAvgForColumn(latestRows, day7Index);
    const previousDay7 = calculateAvgForColumn(previousRows, day7Index);
    const latestDay30 = calculateAvgForColumn(latestRows, day30Index);
    const previousDay30 = calculateAvgForColumn(previousRows, day30Index);

    return {
      day1: calculateDelta(latestDay1, previousDay1),
      day7: calculateDelta(latestDay7, previousDay7),
      day30: calculateDelta(latestDay30, previousDay30),
    };
  }, [day1Index, day7Index, day30Index, rows]);

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

  const handleExport = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `retention-${normalizedProjectIds || "all-projects"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-[1280px] space-y-4 px-2 py-2">
      <section>
        <div className="mb-3 text-[22px] font-semibold tracking-[-0.02em] text-[#0f2d0f]">Retention</div>

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
              <RefreshCw className="mr-1 h-3.5 w-3.5" />
              Refresh
            </Button>
            <Button onClick={handleExport} className="h-8 rounded-lg bg-[#1a6e2e] px-3 text-xs font-semibold text-white hover:bg-[#155a24]">
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
          Select a project to load retention analytics.
        </div>
      )}

      {hasProjectSelection && isPending && !data && <SkeletonCard lines={10} />}

      {hasProjectSelection && isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          Unable to load retention analytics: {error instanceof Error ? error.message : "Request failed"}
        </div>
      )}

      {hasProjectSelection && !isPending && !isError && (
        <>
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-[#daeeda] bg-white px-4 py-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#edfaef]">
                  <Users className="h-4 w-4 text-[#1a6e2e]" />
                </span>
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.04em] text-[#9ab89a]">Total Cohorts</div>
              <div className="mt-1 text-[26px] font-semibold leading-none text-[#0f2d0f]">{rows.length}</div>
              <div className="mt-1 text-[11px] text-[#9ab89a]">cohorts tracked</div>
            </div>

            <div className="rounded-2xl border border-[#b0e8bf] bg-[#edfaef] px-4 py-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#dcf5e0]">
                  <TrendingUp className="h-4 w-4 text-[#1a6e2e]" />
                </span>
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.04em] text-[#7aaa7a]">Day 1 Retention</div>
              <div className="mt-1 text-[26px] font-semibold leading-none text-[#1a6e2e]">{day1Avg}%</div>
              <div className={`mt-1 text-[11px] ${deltaMetrics.day1 >= 0 ? "text-[#5aaa6a]" : "text-[#cc4444]"}`}>
                {deltaMetrics.day1 >= 0 ? "↑" : "↓"} {Math.abs(deltaMetrics.day1)}% vs previous cohorts
              </div>
            </div>

            <div className="rounded-2xl border border-[#daeeda] bg-white px-4 py-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#edfaef]">
                  <TrendingUp className="h-4 w-4 text-[#1a6e2e]" />
                </span>
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.04em] text-[#9ab89a]">Day 7 Retention</div>
              <div className="mt-1 text-[26px] font-semibold leading-none text-[#0f2d0f]">{day7Avg}%</div>
              <div className={`mt-1 text-[11px] ${deltaMetrics.day7 >= 0 ? "text-[#1a8c3a]" : "text-[#cc4444]"}`}>
                {deltaMetrics.day7 >= 0 ? "↑" : "↓"} {Math.abs(deltaMetrics.day7)}% vs previous cohorts
              </div>
            </div>

            <div className="rounded-2xl border border-[#daeeda] bg-white px-4 py-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#fff0f0]">
                  <TrendingDown className="h-4 w-4 text-[#cc4444]" />
                </span>
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.04em] text-[#9ab89a]">Day 30 Retention</div>
              <div className="mt-1 text-[26px] font-semibold leading-none text-[#0f2d0f]">{day30Avg}%</div>
              <div className={`mt-1 text-[11px] ${deltaMetrics.day30 >= 0 ? "text-[#1a8c3a]" : "text-[#cc4444]"}`}>
                {deltaMetrics.day30 >= 0 ? "↑" : "↓"} {Math.abs(deltaMetrics.day30)}% vs previous cohorts
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#daeeda] bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-[#0f2d0f]">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#edfaef]">
                  <TrendingUp className="h-3.5 w-3.5 text-[#1a6e2e]" />
                </span>
                Average Retention Curve
              </div>
              <span className="text-[11px] text-[#9ab89a]">avg across {rows.length} cohorts</span>
            </div>

            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={curveData} margin={{ top: 8, right: 6, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="retGradLive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1a8c3a" stopOpacity={0.16} />
                    <stop offset="100%" stopColor="#1a8c3a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f0f7f0" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#9ab89a" }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 10, fill: "#9ab89a" }}
                  axisLine={false}
                  tickLine={false}
                  unit="%"
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                />
                <Tooltip formatter={(value: number) => [`${value}% retained`, ""]} labelFormatter={(label) => `${label}`} />
                <Area type="monotone" dataKey="retention" stroke="#1a8c3a" strokeWidth={2.5} fill="url(#retGradLive)" />
              </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-[#daeeda] bg-white">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#f0f7f0] px-5 py-4">
              <div>
                <div className="flex items-center gap-2 text-[14px] font-semibold text-[#0f2d0f]">
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#edfaef]">
                    <Filter className="h-4 w-4 text-[#1a6e2e]" />
                  </span>
                  Cohort Heatmap
                </div>
                <div className="mt-1 text-[11px] text-[#9ab89a]">Weekly cohorts · % of users returning per period</div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium text-[#aac8aa]">Low</span>
                  <div className="h-2 w-24 rounded-full bg-gradient-to-r from-[#e0f5e8] via-[#88dd99] to-[#0a4a1e]" />
                  <span className="text-[10px] font-medium text-[#aac8aa]">High</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="rounded-md border border-[#daeeda] bg-[#f4faf4] px-2.5 py-1 text-center">
                    <div className="text-[13px] font-semibold text-[#0f2d0f]">{rows.length}</div>
                    <div className="text-[9px] uppercase tracking-[0.04em] text-[#aac8aa]">Cohorts</div>
                  </div>
                  <div className="rounded-md border border-[#daeeda] bg-[#f4faf4] px-2.5 py-1 text-center">
                    <div className="text-[13px] font-semibold text-[#0f2d0f]">{day1Avg}%</div>
                    <div className="text-[9px] uppercase tracking-[0.04em] text-[#aac8aa]">Day 1 avg</div>
                  </div>
                  <div className="rounded-md border border-[#daeeda] bg-[#f4faf4] px-2.5 py-1 text-center">
                    <div className="text-[13px] font-semibold text-[#0f2d0f]">{day30Avg}%</div>
                    <div className="text-[9px] uppercase tracking-[0.04em] text-[#aac8aa]">Day 30 avg</div>
                  </div>
                </div>
              </div>
            </div>

            {(rows ?? []).length === 0 ? (
              <div className="p-6 text-sm text-[#9ab89a]">No cohort data available for selected filters.</div>
            ) : (
              <div className="overflow-x-auto pb-1">
                <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#fafcfa]">
                  <th className="min-w-[180px] px-5 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.04em] text-[#aac8aa]">
                    Cohort
                  </th>
                  <th className="min-w-[72px] px-4 py-2 text-right text-[10px] font-semibold uppercase tracking-[0.04em] text-[#aac8aa]">
                    Users
                  </th>
                  {columns.map((col, index) => (
                    <th key={col} className={`min-w-[72px] px-1 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.04em] ${index === 0 ? "text-[#1a6e2e]" : "text-[#aac8aa]"}`}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const usersWidth = Math.max(8, Math.round((row.users / maxUsers) * 100));
                  const cohortTitle = row.cohortLabel ?? row.cohort;
                  const cohortSubtitle = row.cohortRange ?? row.cohort;

                  return (
                  <tr key={row.cohort} className="border-t border-[#f4faf4] hover:bg-[#fafff8]">
                    <td className="px-5 py-2.5">
                      <div className="text-[12px] font-medium text-[#1a2a1a]">{cohortTitle}</div>
                      <div className="mt-0.5 text-[10px] text-[#aac8aa]">{cohortSubtitle}</div>
                    </td>
                    <td className="px-4 py-2.5 text-right align-middle">
                      <div className="text-[12px] font-semibold text-[#0f2d0f]">{row.users.toLocaleString()}</div>
                      <div className="ml-auto mt-1 h-[3px] w-12 overflow-hidden rounded-full bg-[#f0f7f0]">
                        <div className="h-full rounded-full bg-[#b8ddb8]" style={{ width: `${usersWidth}%` }} />
                      </div>
                    </td>
                    {row.retention.map((val, index) => (
                      <td key={`${row.cohort}-${index}`} className="px-1 py-1.5 text-center align-middle">
                        {val === null ? (
                          <div className="mx-auto inline-flex h-[42px] w-[60px] items-center justify-center rounded-[10px] border-[1.5px] border-dashed border-[#daeeda]">
                            <span className="h-[5px] w-[5px] rounded-full bg-[#c8ddc8]" />
                          </div>
                        ) : (
                          <div
                            className="mx-auto inline-flex h-[42px] w-[60px] flex-col items-center justify-center gap-[2px] rounded-[10px]"
                            style={{ background: index === 0 ? "#0a4a1e" : getCellBg(val), color: index === 0 ? "#fff" : getCellText(val) }}
                          >
                            <span className="text-[13px] font-semibold leading-none">{val}%</span>
                            <span className="text-[9px] leading-none opacity-75">{formatCompactCount(Math.round(row.users * (val / 100)))}</span>
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[#daeeda] bg-[#f6fbf6]">
                  <td className="px-5 py-2 text-left text-[12px] font-semibold text-[#3a7a3a]">Avg across cohorts</td>
                  <td className="px-4 py-2 text-right text-[12px] text-[#9ab89a]">-</td>
                  {columns.map((_, index) => {
                    const avg = calculateAvgForColumn(rows.map((row) => row.retention), index);
                    const hasValues = rows.some((row) => row.retention[index] !== null);

                    if (!hasValues) {
                      return (
                        <td key={`avg-${index}`} className="px-1 py-2 text-center">
                          <div className="mx-auto inline-flex h-9 w-[60px] items-center justify-center rounded-[9px] border-[1.5px] border-dashed border-[#daeeda]">
                            <span className="h-[5px] w-[5px] rounded-full bg-[#c8ddc8]" />
                          </div>
                        </td>
                      );
                    }

                    return (
                      <td key={`avg-${index}`} className="px-1 py-2 text-center">
                        <div
                          className="mx-auto inline-flex h-9 w-[60px] items-center justify-center rounded-[9px] text-[12px] font-bold"
                          style={{ background: index === 0 ? "#0a4a1e" : getCellBg(avg), color: index === 0 ? "#fff" : getCellText(avg) }}
                        >
                          {avg}%
                        </div>
                      </td>
                    );
                  })}
                </tr>
              </tfoot>
            </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
