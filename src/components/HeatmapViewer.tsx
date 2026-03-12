import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useHeatmap } from "@/hooks/useHeatmap";
import {
  getScaledData,
  type HeatmapMode,
  type HeatmapPoint,
} from "@/lib/heatmapData";
import type { LiveHeatmapPoint } from "@/lib/heatmapApi";
import { ZoomIn, ZoomOut, Maximize2, Minimize2 } from "lucide-react";
import WebpagePreview from "./WebpagePreview";

interface HeatmapViewerProps {
  mode: HeatmapMode;
  loading?: boolean;
  liveData?: LiveHeatmapPoint[];
}

/* ─── Main Viewer ─── */
const HeatmapViewer: React.FC<HeatmapViewerProps> = ({
  mode,
  loading = false,
  liveData,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [scaledData, setScaledData] = useState<HeatmapPoint[]>([]);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ── Measure container ──
  const measure = useCallback(() => {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setDimensions({
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      });
    }
  }, []);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (wrapperRef.current) ro.observe(wrapperRef.current);
    return () => ro.disconnect();
  }, [measure]);

  // ── Scale data when dimensions or mode change ──
  useEffect(() => {
    if (dimensions.width > 0 && dimensions.height > 0) {
      if (liveData && liveData.length > 0) {
        const mapped = liveData.map((point) => ({
          x: Math.round(point.xRatio * dimensions.width),
          y: Math.round(point.yRatio * dimensions.height),
          value: point.value,
        }));
        setScaledData(mapped);
        return;
      }

      setScaledData(getScaledData(mode, dimensions.width, dimensions.height));
    }
  }, [mode, dimensions, liveData]);

  const radiusMap: Record<HeatmapMode, number> = {
    click: 35,
    scroll: 50,
    attention: 55,
  };

  const { containerRef } = useHeatmap(scaledData, {
    radius: radiusMap[mode],
    maxOpacity: mode === "scroll" ? 0.45 : 0.55,
    blur: mode === "scroll" ? 0.95 : 0.85,
  });

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.15, 2));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.15, 0.5));

  const toggleFullscreen = () => {
    if (!wrapperRef.current?.parentElement) return;
    if (!document.fullscreenElement) {
      wrapperRef.current.parentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement) setIsFullscreen(false);
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-gray-100 shadow-card bg-white group">
      {/* Floating zoom toolbar */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={handleZoomOut}
          className="p-1.5 rounded-lg bg-white/90 border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-300 transition shadow-sm"
          aria-label="Zoom out"
        >
          <ZoomOut size={14} />
        </button>
        <span className="text-[10px] text-gray-500 font-medium min-w-[36px] text-center tabular-nums">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={handleZoomIn}
          className="p-1.5 rounded-lg bg-white/90 border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-300 transition shadow-sm"
          aria-label="Zoom in"
        >
          <ZoomIn size={14} />
        </button>
        <div className="w-px h-4 bg-gray-200 mx-0.5" />
        <button
          onClick={toggleFullscreen}
          className="p-1.5 rounded-lg bg-white/90 border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-300 transition shadow-sm"
          aria-label="Toggle fullscreen"
        >
          {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>
      </div>

      {/* Browser-like URL bar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100">
        <div className="flex gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 bg-white rounded-md px-3 py-1 text-[11px] text-gray-400 border border-gray-200 font-mono truncate">
          https://acme-inc.com/landing
        </div>
      </div>

      {/* Heatmap body */}
      <div
        ref={wrapperRef}
        className="relative overflow-auto"
        style={{ height: isFullscreen ? "calc(100vh - 40px)" : 540 }}
      >
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-gray-50"
            >
              <div className="w-full h-full animate-pulse">
                <div className="h-10 bg-gray-200 rounded m-4" />
                <div className="h-40 bg-gray-200 rounded mx-4 mt-2" />
                <div className="grid grid-cols-3 gap-3 mx-4 mt-4">
                  <div className="h-24 bg-gray-200 rounded" />
                  <div className="h-24 bg-gray-200 rounded" />
                  <div className="h-24 bg-gray-200 rounded" />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={`heatmap-${mode}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="origin-top-left"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: "top left",
              }}
            >
              {/* Website preview underneath */}
              <WebpagePreview />

              {/* Heatmap canvas overlay */}
              <div
                ref={containerRef}
                className="absolute inset-0 z-[5]"
                style={{ pointerEvents: "none" }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Inline legend */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-1.5 shadow-sm border border-gray-100 z-10">
          <span className="text-[10px] text-gray-500 font-medium">Low</span>
          <div className="h-1.5 w-24 rounded-full" style={{ background: 'linear-gradient(to right, #3b82f6, #22c55e, #facc15, #ef4444)' }} />
          <span className="text-[10px] text-gray-500 font-medium">High</span>
        </div>
      </div>
    </div>
  );
};

export default HeatmapViewer;
