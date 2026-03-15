import { apiGet } from "@/lib/apiClient";
import type { DashboardDevice, DashboardUserType } from "@/lib/dashboardFilters";

export interface AnalyticsQuery {
  projectIds: string;
  start?: string;
  end?: string;
  device?: DashboardDevice;
  userType?: DashboardUserType;
  pagePath?: string;
}

function mapDevice(device?: DashboardDevice) {
  if (!device || device === "All Devices") return undefined;
  if (device === "Web") return "desktop";
  if (device === "Mobile") return "mobile";
  return "tablet";
}

function mapUserType(userType?: DashboardUserType) {
  if (!userType || userType === "All Users") return undefined;
  return userType.toLowerCase();
}

function toParams(query: AnalyticsQuery) {
  return {
    projectIds: query.projectIds,
    start: query.start,
    end: query.end,
    deviceType: mapDevice(query.device),
    userType: mapUserType(query.userType),
    pagePath: query.pagePath,
  };
}

export interface RealtimeAnalyticsResponse {
  projectIds: string[];
  onlineUsers: number;
  trend: "up" | "down" | "stable";
  lastUpdated: string;
  from: string;
  to: string;
  data: Array<{ t: number; label: string; v: number }>;
  regions: Array<{ name: string; users: number; pct: number }>;
  pages: Array<{ path: string; events: number }>;
  stats: {
    sessions: number;
    avgDurationSec: number;
    bounceRate: number;
  };
  newVsReturning: {
    new: number;
    returning: number;
  };
  deviceBreakdown: Array<{ name: "mobile" | "desktop" | "tablet"; value: number }>;
  peakTraffic: {
    time: string;
    users: number;
    deltaPct: number;
  };
}

export interface FunnelsAnalyticsResponse {
  projectIds: string[];
  stages: Array<{ name: string; value: number }>;
  totals: {
    visitors: number;
    converted: number;
    conversionRate: number;
  };
}

export interface RetentionAnalyticsResponse {
  projectIds: string[];
  cohortColumns: string[];
  cohortData: Array<{
    cohort: string;
    users: number;
    retention: Array<number | null>;
  }>;
}

export interface PerformanceAnalyticsResponse {
  projectIds: string[];
  apiMetrics: {
    avgResponseMs: number;
    errorRate: number;
    failedRequests: number;
    slowEndpoints: Array<{
      path: string;
      p99: number;
      status: "ok" | "warning" | "critical";
    }>;
  };
  responseTimeSeries: Array<{ time: string; ms: number }>;
  errorRateSeries: Array<{ time: string; rate: number }>;
}

export interface OverviewAnalyticsResponse {
  projectIds: string[];
  from: string;
  to: string;
  kpiCards: Array<{
    title: string;
    value: string;
    change: string;
    positive: boolean;
    sub: string;
    trendSeries: number[];
  }>;
  dauSeries: Array<{ day: string; users: number; sessions: number }>;
  deviceData: Array<{ name: string; value: number }>;
  hourlyTraffic: Array<{ hour: string; users: number }>;
  topPages: Array<{ path: string; views: number; bounce: string }>;
  conversionSummary: {
    rate: number;
    delta: number;
  };
}

export interface SessionReplayResponse {
  projectIds: string[];
  from: string;
  to: string;
  stats: {
    totalSessions: number;
    avgDurationSec: number;
    mobileSessions: number;
  };
  sessions: Array<{
    id: string;
    user: string;
    email: string;
    device: "desktop" | "tablet" | "mobile";
    durationSec: number;
    pages: number;
    clicks: number;
    scrollDepth: number;
    startTime: string;
    events: Array<{
      time: string;
      type: "click" | "scroll" | "attention";
      detail: string;
    }>;
  }>;
}

export function fetchRealtimeAnalytics(query: AnalyticsQuery) {
  return apiGet<RealtimeAnalyticsResponse>("/api/analytics/realtime", toParams(query));
}

export function fetchFunnelAnalytics(query: AnalyticsQuery) {
  return apiGet<FunnelsAnalyticsResponse>("/api/analytics/funnels", toParams(query));
}

export function fetchRetentionAnalytics(query: AnalyticsQuery) {
  return apiGet<RetentionAnalyticsResponse>("/api/analytics/retention", toParams(query));
}

export function fetchPerformanceAnalytics(query: AnalyticsQuery) {
  return apiGet<PerformanceAnalyticsResponse>("/api/analytics/performance", toParams(query));
}

export function fetchOverviewAnalytics(query: AnalyticsQuery) {
  return apiGet<OverviewAnalyticsResponse>("/api/analytics/overview", toParams(query));
}

export function fetchSessionReplayAnalytics(query: AnalyticsQuery & { search?: string; limit?: number }) {
  return apiGet<SessionReplayResponse>("/api/analytics/sessions", {
    ...toParams(query),
    search: query.search,
    limit: query.limit,
  });
}
