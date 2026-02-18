import { useState } from "react";
import { RefreshCw, Download, FileText, Calendar, Monitor, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const dateRanges = ["Last 7 days", "Last 30 days", "Last 90 days", "Custom"];
const devices = ["All Devices", "Web", "Mobile", "Tablet"];
const userTypes = ["All Users", "Free", "Pro", "Enterprise"];

interface FilterBarProps {
  title: string;
  subtitle?: string;
}

export function FilterBar({ title, subtitle }: FilterBarProps) {
  const [dateRange, setDateRange] = useState("Last 30 days");
  const [device, setDevice] = useState("All Devices");
  const [userType, setUserType] = useState("All Users");
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
    toast({ title: "Data refreshed", description: "All metrics updated to latest." });
  };

  const handleExport = (format: string) => {
    toast({
      title: `Exporting ${format}…`,
      description: "Your report will be ready in a moment.",
    });
  };

  return (
    <div className="flex flex-col gap-3 sm:gap-0">
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

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-2 mt-3">
        {/* Date range */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              {dateRange}
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-40">
            {dateRanges.map((d) => (
              <DropdownMenuItem
                key={d}
                onClick={() => setDateRange(d)}
                className={cn(dateRange === d && "text-primary font-medium")}
              >
                {d}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Device */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
              <Monitor className="h-3.5 w-3.5 text-muted-foreground" />
              {device}
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-36">
            {devices.map((d) => (
              <DropdownMenuItem
                key={d}
                onClick={() => setDevice(d)}
                className={cn(device === d && "text-primary font-medium")}
              >
                {d}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User type */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              {userType}
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-36">
            {userTypes.map((u) => (
              <DropdownMenuItem
                key={u}
                onClick={() => setUserType(u)}
                className={cn(userType === u && "text-primary font-medium")}
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
          className="h-8 w-8 p-0 ml-auto"
          onClick={handleRefresh}
          title="Refresh data"
        >
          <RefreshCw className={cn("h-3.5 w-3.5 text-muted-foreground", refreshing && "animate-spin")} />
        </Button>
      </div>
    </div>
  );
}
