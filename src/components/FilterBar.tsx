import { useMemo, useState } from "react";
import { RefreshCw, Download, FileText, Calendar, Monitor, User, ChevronDown, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  dateRanges,
  devices,
  userTypes,
  type DashboardDateRange,
  type DashboardDevice,
  type DashboardUserType,
} from "@/lib/dashboardFilters";
import { useQuery } from "@tanstack/react-query";
import { fetchProjects } from "@/lib/projectsApi";
import { getStoredProjectIdList, getStoredProjectIds } from "@/lib/projectSelection";

interface FilterBarProps {
  title: string;
  subtitle?: string;
  dateRange?: DashboardDateRange;
  device?: DashboardDevice;
  userType?: DashboardUserType;
  projectIds?: string;
  onDateRangeChange?: (value: DashboardDateRange) => void;
  onDeviceChange?: (value: DashboardDevice) => void;
  onUserTypeChange?: (value: DashboardUserType) => void;
  onProjectIdsChange?: (value: string) => void;
  onRefresh?: () => Promise<void> | void;
  onExport?: (format: string) => void;
}

export function FilterBar({
  title,
  subtitle,
  dateRange,
  device,
  userType,
  projectIds,
  onDateRangeChange,
  onDeviceChange,
  onUserTypeChange,
  onProjectIdsChange,
  onRefresh,
  onExport,
}: FilterBarProps) {
  const [internalDateRange, setInternalDateRange] = useState<DashboardDateRange>("Last 30 days");
  const [internalDevice, setInternalDevice] = useState<DashboardDevice>("All Devices");
  const [internalUserType, setInternalUserType] = useState<DashboardUserType>("All Users");
  const [internalProjectIds, setInternalProjectIds] = useState(() => getStoredProjectIds());
  const [refreshing, setRefreshing] = useState(false);

  const { data: projectsResp } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  const currentDateRange = dateRange ?? internalDateRange;
  const currentDevice = device ?? internalDevice;
  const currentUserType = userType ?? internalUserType;
  const currentProjectIds = projectIds ?? internalProjectIds;

  const updateDateRange = (value: DashboardDateRange) => {
    if (onDateRangeChange) onDateRangeChange(value);
    else setInternalDateRange(value);
  };

  const updateDevice = (value: DashboardDevice) => {
    if (onDeviceChange) onDeviceChange(value);
    else setInternalDevice(value);
  };

  const updateUserType = (value: DashboardUserType) => {
    if (onUserTypeChange) onUserTypeChange(value);
    else setInternalUserType(value);
  };

  const updateProjectIds = (value: string) => {
    if (onProjectIdsChange) onProjectIdsChange(value);
    else setInternalProjectIds(value);
  };

  const selectedIds = useMemo(() => {
    const ids = (currentProjectIds || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    if (ids.length > 0) {
      return ids;
    }

    return getStoredProjectIdList();
  }, [currentProjectIds]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const selectedProjectNames = useMemo(() => {
    const projectById = new Map((projectsResp?.projects ?? []).map((project) => [project.id, project.name]));
    return selectedIds.map((id) => projectById.get(id) ?? id);
  }, [projectsResp?.projects, selectedIds]);

  const projectLabel = useMemo(() => {
    if (selectedProjectNames.length === 0) return "Select projects";
    if (selectedProjectNames.length === 1) return selectedProjectNames[0];
    return `${selectedProjectNames.length} projects selected`;
  }, [selectedProjectNames]);

  const toggleProjectSelection = (id: string) => {
    const next = selectedSet.has(id)
      ? selectedIds.filter((value) => value !== id)
      : [...selectedIds, id];

    updateProjectIds(next.join(","));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (onRefresh) await onRefresh();
      else await new Promise((resolve) => setTimeout(resolve, 1200));
      toast({ title: "Data refreshed", description: "All metrics updated to latest." });
    } finally {
      setRefreshing(false);
    }
  };

  const handleExport = (format: string) => {
    if (onExport) {
      onExport(format);
      return;
    }

    toast({
      title: `Exporting ${format}…`,
      description: "Your report will be ready in a moment.",
    });
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-card">
      {/* Title row */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>

        {/* Export controls */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5 hidden sm:flex"
            onClick={() => handleExport("CSV")}
          >
            <FileText className="h-3.5 w-3.5" />
            CSV
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                <Download className="h-3.5 w-3.5" />
                Export
                <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => handleExport("CSV")}>
                <FileText className="h-3.5 w-3.5 mr-2" />
                Export CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("PDF")}>
                <FileText className="h-3.5 w-3.5 mr-2" />
                Export PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("Full Report")}>
                <Download className="h-3.5 w-3.5 mr-2" />
                Download Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mt-4 border-t border-border/70 pt-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Project scope</span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5 min-w-[240px] justify-between rounded-lg">
                <span className="inline-flex items-center gap-1.5 truncate text-left">
                  <FolderKanban className="h-3.5 w-3.5 text-primary" />
                  {projectLabel}
                </span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[280px]">
              {(projectsResp?.projects ?? []).map((project) => (
                <DropdownMenuCheckboxItem
                  key={project.id}
                  checked={selectedSet.has(project.id)}
                  onCheckedChange={() => toggleProjectSelection(project.id)}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{project.name}</span>
                    <span className="text-[11px] text-muted-foreground truncate">{project.id}</span>
                  </div>
                </DropdownMenuCheckboxItem>
              ))}
              {!(projectsResp?.projects ?? []).length && (
                <div className="px-2 py-2 text-xs text-muted-foreground">No projects available yet.</div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button asChild variant="ghost" size="sm" className="h-9 text-xs text-muted-foreground hover:text-foreground">
            <Link to="/dashboard/projects">Manage Projects</Link>
          </Button>
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap items-center gap-2">
        {/* Date range */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              {currentDateRange}
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-40">
            {dateRanges.map((d) => (
              <DropdownMenuItem
                key={d}
                onClick={() => updateDateRange(d)}
                className={cn(currentDateRange === d && "text-primary font-medium")}
              >
                {d}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Device */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5">
              <Monitor className="h-3.5 w-3.5 text-muted-foreground" />
              {currentDevice}
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-36">
            {devices.map((d) => (
              <DropdownMenuItem
                key={d}
                onClick={() => updateDevice(d)}
                className={cn(currentDevice === d && "text-primary font-medium")}
              >
                {d}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User type */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              {currentUserType}
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-36">
            {userTypes.map((u) => (
              <DropdownMenuItem
                key={u}
                onClick={() => updateUserType(u)}
                className={cn(currentUserType === u && "text-primary font-medium")}
              >
                {u}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Refresh */}
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 ml-auto"
          onClick={handleRefresh}
          title="Refresh data"
        >
          <RefreshCw className={cn("h-3.5 w-3.5 text-muted-foreground", refreshing && "animate-spin")} />
        </Button>
      </div>
      </div>
    </div>
  );
}
