import React from "react";

/**
 * Standalone heatmap color legend.
 * The legend is now also embedded inline in HeatmapViewer,
 * but this component can still be used independently.
 */
const HeatmapLegend: React.FC = () => {
  return (
    <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-1.5 shadow-sm border border-gray-100 w-fit">
      <span className="text-[10px] text-gray-500 font-medium">Low</span>
      <div className="h-1.5 w-28 rounded-full" style={{ background: 'linear-gradient(to right, #3b82f6, #22c55e, #facc15, #ef4444)' }} />
      <span className="text-[10px] text-gray-500 font-medium">High</span>
    </div>
  );
};

export default HeatmapLegend;
