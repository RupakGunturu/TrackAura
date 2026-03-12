import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import HeatmapControls from "./HeatmapControls";
import HeatmapViewer from "./HeatmapViewer";
import HeatmapInsightsPanel from "./HeatmapInsightsPanel";
import TopInteractions from "./TopInteractions";
import HeatmapSkeleton from "./HeatmapSkeleton";
import {
  heatmapInsights,
  topClickedElements,
  type HeatmapMode,
} from "@/lib/heatmapData";
import { FileQuestion } from "lucide-react";
import { useHeatmapQuery } from "@/hooks/useHeatmapQuery";
import { startHeatmapTracker } from "@/lib/tracker";

const HeatmapDashboard: React.FC = () => {
  const [mode, setMode] = useState<HeatmapMode>("click");
  const projectId = import.meta.env.VITE_PROJECT_ID || "demo-project";
  const pagePath = "/dashboard/heatmaps";

  const { data, isLoading } = useHeatmapQuery({
    projectId,
    pagePath,
    mode,
  });

  const hasData = (data?.points?.length ?? 0) > 0;

  useEffect(() => {
    const stopTracker = startHeatmapTracker({
      projectId,
      pagePath,
    });

    return () => stopTracker();
  }, [projectId, pagePath]);

  const handleModeChange = (newMode: HeatmapMode) => {
    setMode(newMode);
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
        <HeatmapControls mode={mode} onModeChange={handleModeChange} />
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
          <button className="mt-5 text-sm font-medium text-white bg-primary px-5 py-2.5 rounded-xl hover:bg-primary/90 transition shadow-sm">
            Setup Tracking
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="px-2 py-6 flex flex-col gap-6">
      {/* Top Controls */}
      <HeatmapControls mode={mode} onModeChange={handleModeChange} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Heatmap Viewer */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <HeatmapViewer mode={mode} loading={false} liveData={data?.points ?? []} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right: Insights + Top Elements */}
        <div className="flex flex-col gap-6">
          <HeatmapInsightsPanel insights={heatmapInsights} />
          <TopInteractions elements={topClickedElements} />
        </div>
      </div>
    </div>
  );
};

export default HeatmapDashboard;
