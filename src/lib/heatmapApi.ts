import { apiGet, apiPost } from "@/lib/apiClient";
import type { HeatmapMode } from "@/lib/heatmapData";

export interface LiveHeatmapPoint {
  xRatio: number;
  yRatio: number;
  value: number;
}

export interface HeatmapQueryParams {
  projectId: string;
  pagePath?: string;
  mode: HeatmapMode;
  start?: string;
  end?: string;
  deviceType?: "desktop" | "tablet" | "mobile";
  limit?: number;
}

export interface HeatmapQueryResponse {
  mode: HeatmapMode;
  totalRows: number;
  points: LiveHeatmapPoint[];
  viewport?: {
    width: number;
    height: number;
  } | null;
}

export interface HeatEventPayload {
  eventType: HeatmapMode;
  x: number;
  y: number;
  value: number;
  viewportW: number;
  viewportH: number;
  deviceType: "desktop" | "tablet" | "mobile";
  createdAt?: string;
}

export interface HeatEventBatch {
  projectId: string;
  pagePath: string;
  sessionId: string;
  events: HeatEventPayload[];
}

export async function fetchHeatmapData(params: HeatmapQueryParams) {
  return apiGet<HeatmapQueryResponse>("/api/heatmap", params);
}

export async function sendHeatEventBatch(batch: HeatEventBatch) {
  return apiPost<HeatEventBatch, { inserted: number }>("/api/events/batch", batch);
}
