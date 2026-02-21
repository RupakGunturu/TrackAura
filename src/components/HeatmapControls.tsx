import React from "react";
import { motion } from "framer-motion";
import {
  MousePointerClick,
  ArrowDownUp,
  Eye,
  Calendar,
  Monitor,
  Smartphone,
  Tablet,
  Download,
  RefreshCw,
} from "lucide-react";
import type { HeatmapMode } from "@/lib/heatmapData";

interface HeatmapControlsProps {
  mode: HeatmapMode;
  onModeChange: (mode: HeatmapMode) => void;
}

const modes: { key: HeatmapMode; label: string; icon: React.ReactNode }[] = [
  { key: "click", label: "Click", icon: <MousePointerClick size={15} /> },
  { key: "scroll", label: "Scroll", icon: <ArrowDownUp size={15} /> },
  { key: "attention", label: "Attention", icon: <Eye size={15} /> },
];

const HeatmapControls: React.FC<HeatmapControlsProps> = ({
  mode,
  onModeChange,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
    >
      {/* Left: Title + Mode tabs */}
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">
            Heatmap Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Visualize user interactions across your pages
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-0.5 w-fit overflow-x-auto">
          {modes.map((m) => (
            <button
              key={m.key}
              onClick={() => onModeChange(m.key)}
              className={`relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                mode === m.key
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground/80"
              }`}
              aria-pressed={mode === m.key}
              role="tab"
            >
              {mode === m.key && (
                <motion.div
                  layoutId="heatmap-tab-bg"
                  className="absolute inset-0 bg-white rounded-lg shadow-sm"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {m.icon}
                {m.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <button className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-white border border-gray-200 rounded-lg px-3 py-2 hover:border-gray-300 hover:text-foreground transition">
          <Calendar size={13} />
          Last 7 days
        </button>

        <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden">
          {[
            { icon: <Monitor size={13} />, label: "Desktop" },
            { icon: <Tablet size={13} />, label: "Tablet" },
            { icon: <Smartphone size={13} />, label: "Mobile" },
          ].map((d, i) => (
            <button
              key={d.label}
              className={`flex items-center gap-1 px-2.5 py-2 text-xs font-medium transition ${
                i === 0
                  ? "bg-primary/5 text-primary border-r border-gray-200"
                  : "text-muted-foreground hover:text-foreground border-r border-gray-200 last:border-r-0"
              }`}
              title={d.label}
            >
              {d.icon}
              <span className="hidden md:inline">{d.label}</span>
            </button>
          ))}
        </div>

        <button className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-white border border-gray-200 rounded-lg px-3 py-2 hover:border-gray-300 hover:text-foreground transition">
          <Download size={13} />
          Export
        </button>

        <button className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-white border border-gray-200 rounded-lg px-2.5 py-2 hover:border-gray-300 hover:text-foreground transition">
          <RefreshCw size={13} />
        </button>
      </div>
    </motion.div>
  );
};

export default HeatmapControls;
