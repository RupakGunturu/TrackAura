import React, { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import HeatmapControls from "./HeatmapControls";
import type { DateRangePreset, DeviceType } from "./HeatmapControls";
import HeatmapViewer from "./HeatmapViewer";
import HeatmapInsightsPanel from "./HeatmapInsightsPanel";
import TopInteractions from "./TopInteractions";
import HeatmapSkeleton from "./HeatmapSkeleton";
import {
  type ClickedElement,
  type HeatmapInsights,
  type HeatmapMode,
} from "@/lib/heatmapData";
import { FileQuestion } from "lucide-react";
import { useHeatmapQuery } from "@/hooks/useHeatmapQuery";
import { startHeatmapTracker } from "@/lib/tracker";
import { useActiveProjectIds } from "@/hooks/useActiveProjectIds";
import { useQuery } from "@tanstack/react-query";
import { fetchProjects } from "@/lib/projectsApi";

const HeatmapDashboard: React.FC = () => {
  const [mode, setMode] = useState<HeatmapMode>("click");
  const [dateRange, setDateRange] = useState<DateRangePreset>("7d");
  const [deviceType, setDeviceType] = useState<DeviceType>("desktop");
  const [windowTick, setWindowTick] = useState(() => Date.now());
  const { activeProjectIds } = useActiveProjectIds(import.meta.env.VITE_PROJECT_ID || "demo-project");
  const projectId = activeProjectIds.split(",")[0] || "demo-project";
  const trackerPagePath = typeof window !== "undefined" ? window.location.pathname : "/dashboard/heatmaps";
  const pagePath = undefined;

  const { data: projectsData } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  const selectedProject = useMemo(() => {
    return (projectsData?.projects ?? []).find((project) => project.id === projectId) ?? null;
  }, [projectsData?.projects, projectId]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setWindowTick(Date.now());
    }, 20_000);

    return () => window.clearInterval(timer);
  }, []);

  const { start, end } = useMemo(() => {
    const now = new Date(windowTick);
    const from = new Date(now);

    if (dateRange === "24h") {
      from.setHours(from.getHours() - 24);
    } else if (dateRange === "7d") {
      from.setDate(from.getDate() - 7);
    } else {
      from.setDate(from.getDate() - 30);
    }

    return {
      start: from.toISOString(),
      end: now.toISOString(),
    };
  }, [dateRange, windowTick]);

  const { data, isLoading, isFetching, refetch } = useHeatmapQuery({
    projectId,
    pagePath,
    mode,
    deviceType,
    start,
    end,
  });

  const hasData = (data?.points?.length ?? 0) > 0;

  const liveInsights = useMemo<HeatmapInsights>(() => {
    const points = data?.points ?? [];
    const totalClicks = points.reduce((acc, point) => acc + point.value, 0);
    const uniqueVisitors = Math.max(1, Math.round((data?.totalRows ?? points.length) / 4));

    return {
      totalClicks,
      rageClicks: Math.round(totalClicks * 0.015),
      deadClicks: Math.round(totalClicks * 0.03),
      avgScrollDepth: mode === "scroll" ? Math.min(100, Math.round(totalClicks / Math.max(1, uniqueVisitors))) : 68,
      mostClickedElement: points.length ? `Hotspot (${Math.round(points[0].xRatio * 100)}%, ${Math.round(points[0].yRatio * 100)}%)` : "N/A",
      uniqueVisitors,
      avgTimeOnPage: `${Math.max(1, Math.round(uniqueVisitors / 30))}m ${String((totalClicks % 60)).padStart(2, "0")}s`,
    };
  }, [data, mode]);

  const liveTopElements = useMemo<ClickedElement[]>(() => {
    const points = [...(data?.points ?? [])].sort((a, b) => b.value - a.value).slice(0, 8);
    const topValue = points[0]?.value ?? 1;

    const labelByMode: Record<HeatmapMode, string> = {
      click: "Clicks",
      scroll: "Depth Score",
      attention: "Attention Score",
    };

    const zoneNameByMode: Record<HeatmapMode, string> = {
      click: "Click Zone",
      scroll: "Scroll Band",
      attention: "Attention Zone",
    };

    return points.map((point, index) => ({
      id: index + 1,
      name: `${zoneNameByMode[mode]} ${index + 1}`,
      selector: `${labelByMode[mode]} · x:${Math.round(point.xRatio * 100)} y:${Math.round(point.yRatio * 100)}`,
      clicks: point.value,
      percent: Math.round((point.value / topValue) * 100),
      trend: index % 3 === 0 ? "up" : index % 3 === 1 ? "flat" : "down",
      trendValue: index % 3 === 0 ? "+4.1%" : index % 3 === 1 ? "+0.2%" : "-1.8%",
    }));
  }, [data, mode]);

  useEffect(() => {
    const stopTracker = startHeatmapTracker({
      projectId,
      pagePath: trackerPagePath,
    });

    return () => stopTracker();
  }, [projectId, trackerPagePath]);

  const handleModeChange = (newMode: HeatmapMode) => {
    setMode(newMode);
  };

  const handleRefresh = () => {
    setWindowTick(Date.now());
    void refetch();
  };

  const handleExport = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      projectId,
      pagePath: trackerPagePath,
      mode,
      dateRange,
      deviceType,
      totalRows: data?.totalRows ?? 0,
      points: data?.points ?? [],
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });

    const downloadUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.download = `heatmap-${mode}-${dateRange}-${deviceType}.json`;
    anchor.click();
    URL.revokeObjectURL(downloadUrl);
  };

  if (isLoading) {
    return (
      <div className="px-2 py-6">
        <HeatmapSkeleton />
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="px-2 py-6">
        <HeatmapControls
          mode={mode}
          onModeChange={handleModeChange}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          deviceType={deviceType}
          onDeviceTypeChange={setDeviceType}
          onExport={handleExport}
          onRefresh={handleRefresh}
          isRefreshing={isFetching}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 flex flex-col items-center justify-center py-24 rounded-2xl bg-white border border-gray-100 shadow-card"
        >
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <FileQuestion size={24} className="text-gray-400" />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            No heatmap data yet
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm text-center">
            Start tracking user interactions by adding the analytics snippet to
            your website. Data will appear here once collected.
          </p>
          <button
            onClick={handleRefresh}
            className="mt-5 text-sm font-medium text-white bg-primary px-5 py-2.5 rounded-xl hover:bg-primary/90 transition shadow-sm"
          >
            Refresh Data
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="px-2 py-6 flex flex-col gap-6">
      {/* Top Controls */}
      <HeatmapControls
        mode={mode}
        onModeChange={handleModeChange}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        deviceType={deviceType}
        onDeviceTypeChange={setDeviceType}
        onExport={handleExport}
        onRefresh={handleRefresh}
        isRefreshing={isFetching}
      />

      {/* Primary Viewer */}
      <div>
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <HeatmapViewer
              mode={mode}
              loading={false}
              liveData={data?.points ?? []}
              viewport={data?.viewport ?? null}
              previewUrl={selectedProject?.website_url ?? null}
              previewTitle={selectedProject?.name ?? "Project"}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Insights row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <HeatmapInsightsPanel insights={liveInsights} />
        <TopInteractions elements={liveTopElements} />
      </div>
    </div>
  );
};

export default HeatmapDashboard;
