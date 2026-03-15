import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { fetchFunnelAnalytics, type FunnelsAnalyticsResponse } from "@/lib/analyticsApi";
import { getDateRangeBounds, normalizeProjectIds, type DashboardUserType } from "@/lib/dashboardFilters";
import { useActiveProjectIds } from "@/hooks/useActiveProjectIds";

type FunnelDateRange = "Today" | "Last 7 days" | "Last 30 days" | "Last 90 days" | "This year";
type FunnelDevice = "All Devices" | "Desktop" | "Mobile" | "Tablet";

const DATE_OPTIONS: FunnelDateRange[] = ["Today", "Last 7 days", "Last 30 days", "Last 90 days", "This year"];
const DEVICE_OPTIONS: FunnelDevice[] = ["All Devices", "Desktop", "Mobile", "Tablet"];
const USER_OPTIONS: DashboardUserType[] = ["All Users", "Free", "Pro", "Enterprise"];

function getFunnelBounds(dateRange: FunnelDateRange) {
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

function toApiDevice(device: FunnelDevice): "All Devices" | "Web" | "Mobile" | "Tablet" {
  if (device === "Desktop") return "Web";
  return device;
}

function mappedStages(data?: FunnelsAnalyticsResponse) {
  const raw = data?.stages ?? [];
  const rename: Record<string, string> = {
    Visitors: "Landing Page",
    Engaged: "Sign Up",
    Clicked: "Onboarding",
    Scrolled: "Add to Cart",
    Converted: "Purchase",
  };

  return raw.map((stage, index) => ({
    ...stage,
    displayName: rename[stage.name] ?? stage.name,
    index,
  }));
}

function stageColor(index: number) {
  const colors = ["#1a8c3a", "#2eaa50", "#44bb66", "#66cc80", "#99ddaa"];
  return colors[Math.min(index, colors.length - 1)];
}

export default function FunnelsPage() {
  const { activeProjectIds, setActiveProjectIds } = useActiveProjectIds("");

  const [dateRange, setDateRange] = useState<FunnelDateRange>("Last 30 days");
  const [device, setDevice] = useState<FunnelDevice>("All Devices");
  const [userType, setUserType] = useState<DashboardUserType>("All Users");

  const normalizedProjectIds = normalizeProjectIds(activeProjectIds);
  const hasProjectSelection = normalizedProjectIds.length > 0;

  const { start, end } = useMemo(() => getFunnelBounds(dateRange), [dateRange]);

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

  const funnelQuery = useQuery({
    queryKey: ["analytics", "funnels", normalizedProjectIds, start, end, device, userType],
    queryFn: () =>
      fetchFunnelAnalytics({
        projectIds: normalizedProjectIds,
        start,
        end,
        device: toApiDevice(device),
        userType,
      }),
    enabled: hasProjectSelection,
    retry: 1,
  });

  const { data, isPending, isFetching, isError, error, refetch } = funnelQuery;

  const stageRows = useMemo(() => mappedStages(data), [data]);
  const topValue = Math.max(1, stageRows[0]?.value ?? 0);

  const biggestDrop = useMemo(() => {
    if (stageRows.length < 2) {
      return { from: "-", to: "-", pct: 0 };
    }

    let best = { from: stageRows[0].displayName, to: stageRows[1].displayName, pct: 0 };

    for (let i = 1; i < stageRows.length; i += 1) {
      const previous = stageRows[i - 1].value;
      const current = stageRows[i].value;
      const dropPct = previous > 0 ? Math.round(((previous - current) / previous) * 100) : 0;
      if (dropPct > best.pct) {
        best = {
          from: stageRows[i - 1].displayName,
          to: stageRows[i].displayName,
          pct: dropPct,
        };
      }
    }

    return best;
  }, [stageRows]);

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

  const activeTagCount = [
    dateRange !== "Last 30 days",
    device !== "All Devices",
    userType !== "All Users",
    projectLabel !== "All Projects",
  ].filter(Boolean).length;

  const handleExport = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `funnels-${normalizedProjectIds || "all-projects"}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-[1280px] space-y-4 px-2 py-2">
      <section>
        <div className="mb-3 text-[22px] font-semibold tracking-[-0.02em] text-[#0f2d0f]">Conversion Funnel</div>

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
          Select a project to load conversion funnel data.
        </div>
      )}

      {hasProjectSelection && isPending && !data && <SkeletonCard lines={10} />}

      {hasProjectSelection && isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Unable to load funnel analytics: {error instanceof Error ? error.message : "Request failed"}
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
              <div className="text-[10px] font-semibold uppercase tracking-[0.04em] text-[#9ab89a]">Total Visitors</div>
              <div className="mt-1 text-[26px] font-semibold leading-none text-[#0f2d0f]">{(data?.totals.visitors ?? 0).toLocaleString()}</div>
              <div className="mt-1 text-[11px] text-[#9ab89a]">entered the funnel</div>
            </div>

            <div className="rounded-2xl border border-[#b0e8bf] bg-[#edfaef] px-4 py-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#dcf5e0]">
                  <TrendingUp className="h-4 w-4 text-[#1a6e2e]" />
                </span>
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.04em] text-[#7aaa7a]">Conversion Rate</div>
              <div className="mt-1 text-[26px] font-semibold leading-none text-[#1a6e2e]">{(data?.totals.conversionRate ?? 0).toFixed(1)}%</div>
              <div className="mt-1 text-[11px] text-[#5aaa6a]">{isFetching ? "Refreshing" : "live from backend"}</div>
            </div>

            <div className="rounded-2xl border border-[#daeeda] bg-white px-4 py-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#fff0f0]">
                  <TrendingDown className="h-4 w-4 text-[#cc4444]" />
                </span>
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.04em] text-[#9ab89a]">Biggest Drop-off</div>
              <div className="mt-1 text-[20px] font-semibold leading-none text-[#cc4444]">
                {biggestDrop.from} → {biggestDrop.to}
              </div>
              <div className="mt-1 text-[11px] text-[#9ab89a]">−{biggestDrop.pct}% at this transition</div>
            </div>

            <div className="rounded-2xl border border-[#daeeda] bg-white px-4 py-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#edfaef]">
                  <Filter className="h-4 w-4 text-[#1a6e2e]" />
                </span>
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.04em] text-[#9ab89a]">Funnel Steps</div>
              <div className="mt-1 text-[26px] font-semibold leading-none text-[#0f2d0f]">{stageRows.length}</div>
              <div className="mt-1 text-[11px] text-[#9ab89a]">stages tracked</div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#daeeda] bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-[#0f2d0f]">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#edfaef]">
                  <Filter className="h-3.5 w-3.5 text-[#1a6e2e]" />
                </span>
                Funnel Flow
              </div>
              <span className="text-[11px] text-[#9ab89a]">{stageRows.length} stages · real conversion data</span>
            </div>

            <div className="overflow-x-auto pb-2">
              <div className="flex min-w-max items-center gap-0">
              {stageRows.map((stage, index) => {
                const currentPct = Math.round((stage.value / topValue) * 100);
                const previous = index > 0 ? stageRows[index - 1].value : stage.value;
                const dropPct = index > 0 && previous > 0 ? Math.round(((previous - stage.value) / previous) * 100) : 0;
                const color = stageColor(index);
                const nextValue = index < stageRows.length - 1 ? stageRows[index + 1].value : stage.value;
                const connectorDropPct =
                  index < stageRows.length - 1 && stage.value > 0
                    ? Math.round(((stage.value - nextValue) / stage.value) * 100)
                    : 0;

                return (
                  <div key={stage.name} className="flex shrink-0 items-center">
                    <div className="flex h-[236px] w-[170px] flex-col items-center justify-between rounded-xl border border-[#e4f2e4] bg-[#fbfefb] px-3 py-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold text-white" style={{ background: color }}>
                        {index + 1}
                      </div>

                      <div className="text-center">
                        <div className="text-[11px] font-semibold text-[#2a4a2a]">{stage.displayName}</div>
                        <div className="mt-1 text-[15px] font-semibold text-[#0f2d0f]">{stage.value.toLocaleString()}</div>
                        <div className="text-[10px] text-[#9ab89a]">{currentPct}% of entry</div>
                      </div>

                      <div className="h-2 w-full overflow-hidden rounded-full bg-[#f0f7f0]">
                        <div className="h-full rounded-full" style={{ width: `${Math.max(4, currentPct)}%`, background: color }} />
                      </div>

                      <div className="min-h-[20px] text-center">
                        {index > 0 && (
                          <div className="mt-1 inline-flex items-center rounded-[5px] border border-[#ffcccc] bg-[#fff3f3] px-1.5 py-0.5 text-[10px] font-semibold text-[#cc4444]">
                            ↓ {dropPct}%
                          </div>
                        )}
                      </div>
                    </div>

                    {index < stageRows.length - 1 && (
                      <div className="flex w-[56px] shrink-0 flex-col items-center justify-center">
                        <div className="h-[2px] w-full rounded-full bg-[#c8ddc8]" />
                        <span className="mt-1 text-[9px] font-bold text-[#dd8888]">−{connectorDropPct}%</span>
                      </div>
                    )}
                  </div>
                );
              })}
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-[#daeeda] bg-white">
            <div className="flex items-center justify-between border-b border-[#f0f7f0] px-5 py-3.5">
              <div className="text-[13px] font-semibold text-[#0f2d0f]">Stage Breakdown</div>
              <span className="rounded-md border border-[#daeeda] bg-[#f4faf4] px-2 py-0.5 text-[10px] text-[#9ab89a]">{stageRows.length} stages</span>
            </div>

            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#f8fbf8]">
                  <th className="w-9 border-b border-[#f0f7f0] px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.04em] text-[#9ab89a]">#</th>
                  <th className="border-b border-[#f0f7f0] px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.04em] text-[#9ab89a]">Stage</th>
                  <th className="border-b border-[#f0f7f0] px-4 py-2 text-right text-[10px] font-semibold uppercase tracking-[0.04em] text-[#9ab89a]">Users</th>
                  <th className="border-b border-[#f0f7f0] px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.04em] text-[#9ab89a]">% of Total</th>
                  <th className="border-b border-[#f0f7f0] px-4 py-2 text-right text-[10px] font-semibold uppercase tracking-[0.04em] text-[#9ab89a]">Drop-off</th>
                </tr>
              </thead>
              <tbody>
                {stageRows.map((stage, index) => {
                  const pct = Math.round((stage.value / topValue) * 100);
                  const previous = index > 0 ? stageRows[index - 1].value : stage.value;
                  const dropPct = index > 0 && previous > 0 ? Math.round(((previous - stage.value) / previous) * 100) : 0;

                  const color = stageColor(index);

                  return (
                    <tr key={`row-${stage.name}`} className="border-b border-[#f7fbf7] last:border-b-0 hover:bg-[#fafff8]">
                      <td className="px-4 py-2.5 text-[11px] font-semibold text-[#c8ddc8]">{String(index + 1).padStart(2, "0")}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2 text-xs text-[#1a3a1a]">
                          <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                          {stage.displayName}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-right text-[13px] font-semibold text-[#0f2d0f]">{stage.value.toLocaleString()}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="h-1 w-full min-w-[70px] overflow-hidden rounded-full bg-[#f0f7f0]">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                          </div>
                          <span className="w-10 shrink-0 text-right text-[11px] font-semibold text-[#1a6e2e]">{pct}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {index === 0 ? (
                          <span className="inline-flex rounded-[5px] bg-[#edfaef] px-2 py-0.5 text-[10px] font-semibold text-[#1a8c3a]">Entry</span>
                        ) : (
                          <span className="inline-flex rounded-[5px] bg-[#fff3f3] px-2 py-0.5 text-[10px] font-semibold text-[#cc4444]">↓ {dropPct}%</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        </>
      )}
    </div>
  );
}
