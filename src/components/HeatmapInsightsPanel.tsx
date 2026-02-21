import React from "react";
import { motion } from "framer-motion";
import {
  MousePointerClick,
  Flame,
  MousePointerSquareDashed,
  ArrowDownToLine,
  Star,
  Users,
  Clock,
} from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";
import type { HeatmapInsights } from "@/lib/heatmapData";

interface Props {
  insights: HeatmapInsights;
}

interface StatRowProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  format?: "number" | "percent";
  iconColor?: string;
}

const StatRow: React.FC<StatRowProps> = ({
  icon,
  label,
  value,
  suffix,
  format = "number",
  iconColor = "text-gray-400",
}) => {
  const animated = useCountUp(value);
  const display =
    format === "percent"
      ? `${animated}%`
      : animated.toLocaleString() + (suffix || "");

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50 ${iconColor}`}
        >
          {icon}
        </div>
        <span className="text-sm text-muted-foreground font-medium">
          {label}
        </span>
      </div>
      <span className="text-sm font-semibold text-foreground tabular-nums">
        {display}
      </span>
    </div>
  );
};

const HeatmapInsightsPanel: React.FC<Props> = ({ insights }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="rounded-2xl bg-white border border-gray-100 shadow-card p-5 flex flex-col"
    >
      <h2 className="text-base font-semibold text-foreground mb-1">
        Heatmap Insights
      </h2>
      <p className="text-xs text-muted-foreground mb-4">
        Summary of user interaction metrics
      </p>

      <div className="flex flex-col divide-y divide-gray-100">
        <StatRow
          icon={<MousePointerClick size={16} />}
          label="Total Clicks"
          value={insights.totalClicks}
          iconColor="text-primary"
        />
        <StatRow
          icon={<Flame size={16} />}
          label="Rage Clicks"
          value={insights.rageClicks}
          iconColor="text-red-500"
        />
        <StatRow
          icon={<MousePointerSquareDashed size={16} />}
          label="Dead Clicks"
          value={insights.deadClicks}
          iconColor="text-amber-500"
        />
        <StatRow
          icon={<ArrowDownToLine size={16} />}
          label="Avg Scroll Depth"
          value={insights.avgScrollDepth}
          format="percent"
          iconColor="text-blue-500"
        />
        <StatRow
          icon={<Users size={16} />}
          label="Unique Visitors"
          value={insights.uniqueVisitors}
          iconColor="text-emerald-500"
        />
      </div>

      {/* Most clicked element highlight */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-1.5">
          <Star size={14} className="text-amber-400" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Most Clicked
          </span>
        </div>
        <div className="bg-primary/5 rounded-xl px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">
            {insights.mostClickedElement}
          </span>
          <span className="text-xs text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-md">
            #1
          </span>
        </div>
      </div>

      {/* Avg time on page */}
      <div className="mt-3 flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50 text-purple-500">
            <Clock size={16} />
          </div>
          <span className="text-sm text-muted-foreground font-medium">
            Avg Time on Page
          </span>
        </div>
        <span className="text-sm font-semibold text-foreground">
          {insights.avgTimeOnPage}
        </span>
      </div>
    </motion.div>
  );
};

export default HeatmapInsightsPanel;
