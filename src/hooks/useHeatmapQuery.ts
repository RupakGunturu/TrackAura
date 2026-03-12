import { useQuery } from "@tanstack/react-query";
import type { HeatmapMode } from "@/lib/heatmapData";
import { fetchHeatmapData } from "@/lib/heatmapApi";

interface UseHeatmapQueryInput {
  projectId: string;
  pagePath: string;
  mode: HeatmapMode;
  deviceType?: "desktop" | "tablet" | "mobile";
}

export function useHeatmapQuery({ projectId, pagePath, mode, deviceType }: UseHeatmapQueryInput) {
  return useQuery({
    queryKey: ["heatmap", projectId, pagePath, mode, deviceType],
    queryFn: () =>
      fetchHeatmapData({
        projectId,
        pagePath,
        mode,
        deviceType,
      }),
    staleTime: 20_000,
    refetchInterval: 20_000,
  });
}
