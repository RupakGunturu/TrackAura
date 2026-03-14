import { useQuery } from "@tanstack/react-query";
import type { HeatmapMode } from "@/lib/heatmapData";
import { fetchHeatmapData } from "@/lib/heatmapApi";

interface UseHeatmapQueryInput {
  projectId: string;
  pagePath: string;
  mode: HeatmapMode;
  deviceType?: "desktop" | "tablet" | "mobile";
  start?: string;
  end?: string;
}

export function useHeatmapQuery({ projectId, pagePath, mode, deviceType, start, end }: UseHeatmapQueryInput) {
  return useQuery({
    queryKey: ["heatmap", projectId, pagePath, mode, deviceType, start, end],
    queryFn: () =>
      fetchHeatmapData({
        projectId,
        pagePath,
        mode,
        deviceType,
        start,
        end,
      }),
    staleTime: 20_000,
    refetchInterval: 20_000,
  });
}
