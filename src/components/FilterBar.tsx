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
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      {/* Header Section */}
      <div className="mb-4 pb-4 border-b border-gray-100">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
            {subtitle && <p className="text-sm text-gray-600 mt-2">{subtitle}</p>}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-sm gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-9 text-sm gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <Download className="h-4 w-4" />
                  Export
                  <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleExport("CSV")} className="gap-2">
                  <FileText className="h-4 w-4" />
                  Export CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("PDF")} className="gap-2">
                  <FileText className="h-4 w-4" />
                  Export PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("Full Report")} className="gap-2">
                  <Download className="h-4 w-4" />
                  Full Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Projects Dropdown */}
        <div className="md:col-span-1">
          <label className="block text-xs font-semibold text-gray-700 mb-2">Project Scope</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full h-9 text-xs justify-between rounded-lg border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
              >
                <span className="truncate text-left flex-1">{projectLabel}</span>
                <ChevronDown className="h-4 w-4 opacity-60 ml-1 shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <div className="px-2 py-2 text-xs font-medium text-gray-700">
                Select Projects
              </div>
              {(projectsResp?.projects ?? []).map((project) => (
                <DropdownMenuCheckboxItem
                  key={project.id}
                  checked={selectedSet.has(project.id)}
                  onCheckedChange={() => toggleProjectSelection(project.id)}
                  className="text-xs text-gray-700"
                >
                  {project.name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Date Range Dropdown */}
        <div className="md:col-span-1">
          <label className="block text-xs font-semibold text-gray-700 mb-2">Period</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full h-9 text-xs justify-between rounded-lg border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
              >
                <Calendar className="h-3.5 w-3.5 mr-1" />
                <span className="truncate">{currentDateRange}</span>
                <ChevronDown className="h-4 w-4 opacity-60 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {dateRanges.map((range) => (
                <DropdownMenuItem
                  key={range}
                  onClick={() => updateDateRange(range)}
                  className={cn("text-xs cursor-pointer", currentDateRange === range && "bg-blue-50 text-blue-600")}
                >
                  {range}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Device Filter */}
        <div className="md:col-span-1">
          <label className="block text-xs font-semibold text-gray-700 mb-2">Device</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full h-9 text-xs justify-between rounded-lg border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
              >
                <Monitor className="h-3.5 w-3.5 mr-1" />
                <span className="truncate">{currentDevice}</span>
                <ChevronDown className="h-4 w-4 opacity-60 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {devices.map((device) => (
                <DropdownMenuItem
                  key={device}
                  onClick={() => updateDevice(device)}
                  className={cn("text-xs cursor-pointer", currentDevice === device && "bg-blue-50 text-blue-600")}
                >
                  {device}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* User Type Filter */}
        <div className="md:col-span-1">
          <label className="block text-xs font-semibold text-gray-700 mb-2">User Type</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full h-9 text-xs justify-between rounded-lg border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
              >
                <User className="h-3.5 w-3.5 mr-1" />
                <span className="truncate">{currentUserType}</span>
                <ChevronDown className="h-4 w-4 opacity-60 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {userTypes.map((type) => (
                <DropdownMenuItem
                  key={type}
                  onClick={() => updateUserType(type)}
                  className={cn("text-xs cursor-pointer", currentUserType === type && "bg-blue-50 text-blue-600")}
                >
                  {type}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
