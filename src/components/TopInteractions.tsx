import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { ClickedElement } from "@/lib/heatmapData";

interface Props {
  elements: ClickedElement[];
}

const trendIcon = (trend: ClickedElement["trend"]) => {
  switch (trend) {
    case "up":
      return <TrendingUp size={12} className="text-emerald-500" />;
    case "down":
      return <TrendingDown size={12} className="text-red-500" />;
    default:
      return <Minus size={12} className="text-gray-400" />;
  }
};

const trendColor = (trend: ClickedElement["trend"]) => {
  switch (trend) {
    case "up":
      return "text-emerald-600";
    case "down":
      return "text-red-500";
    default:
      return "text-gray-400";
  }
};

const TopInteractions: React.FC<Props> = ({ elements }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="rounded-2xl bg-white border border-gray-100 shadow-card p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Top Clicked Elements
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ranked by total click volume
          </p>
        </div>
        <span className="text-[10px] text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-md font-medium">
          {elements.length} elements
        </span>
      </div>

      <div className="flex flex-col gap-1">
        {elements.map((el, idx) => (
          <div
            key={el.id}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-gray-50 transition-colors group cursor-default"
          >
            {/* Rank */}
            <span
              className={`flex items-center justify-center w-6 h-6 rounded-lg text-[11px] font-bold ${
                idx < 3
                  ? "bg-primary/10 text-primary"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {idx + 1}
            </span>

            {/* Element Name + Selector */}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                {el.name}
              </div>
              <div className="text-[10px] text-muted-foreground font-mono truncate">
                {el.selector}
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-20 flex-shrink-0 hidden sm:block">
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-primary/70"
                  initial={{ width: 0 }}
                  animate={{ width: `${el.percent}%` }}
                  transition={{ duration: 0.8, delay: idx * 0.05 }}
                />
              </div>
            </div>

            {/* Count */}
            <span className="text-xs font-semibold text-foreground tabular-nums min-w-[48px] text-right">
              {el.clicks.toLocaleString()}
            </span>

            {/* Trend */}
            <div className="flex items-center gap-0.5 min-w-[52px] justify-end">
              {trendIcon(el.trend)}
              <span
                className={`text-[10px] font-medium ${trendColor(el.trend)}`}
              >
                {el.trendValue}
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default TopInteractions;
